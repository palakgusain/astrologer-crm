#!/usr/bin/env node
/**
 * Comprehensive QA test suite — Astrologer CRM
 * Covers: auth, pages, CRUD, payments, dashboard, edge cases
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;
const failures = [];
let sessionCookie = "";

function assert(condition, name, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    const msg = detail ? `${name}: ${detail}` : name;
    failures.push(msg);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function login(email = "astrologer@crm.com", password = "password123") {
  const res = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) sessionCookie = setCookie.split(";")[0];
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function request(method, path, body, useCookie = true) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(useCookie && sessionCookie ? { Cookie: sessionCookie } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function testAuth() {
  console.log("\n=== AUTH ===");

  const unauthClients = await fetch(`${BASE}/api/clients`);
  assert(unauthClients.status === 401, "Unauthenticated /api/clients returns 401");

  const unauthDash = await fetch(`${BASE}/api/dashboard`);
  assert(unauthDash.status === 401, "Unauthenticated /api/dashboard returns 401");

  const badLogin = await login("wrong@email.com", "wrongpass");
  assert(badLogin.status === 401, "Wrong credentials return 401");

  const emptyLogin = await request("POST", "/api/auth", { email: "", password: "" }, false);
  assert(emptyLogin.status === 400, "Empty login returns 400");

  const ok = await login();
  assert(ok.status === 200, "Valid login returns 200");
  assert(ok.data?.user?.email === "astrologer@crm.com", "Login returns correct user");

  const me = await request("GET", "/api/auth");
  assert(me.status === 200 && me.data.user?.name, "GET /api/auth returns session user");

  const redirect = await fetch(`${BASE}/`, { redirect: "manual" });
  assert(redirect.status === 307 || redirect.status === 302, "Unauthenticated / redirects to login", `got ${redirect.status}`);

  // Re-login after testing redirect (cookie may be cleared)
  await login();
}

async function testPages() {
  console.log("\n=== PAGE ROUTES ===");

  const loginPage = await fetch(`${BASE}/login`);
  assert(loginPage.status === 200, "Login page returns 200");

  const pages = ["/", "/clients", "/clients/new", "/consultations", "/consultations/new"];
  for (const page of pages) {
    const res = await fetch(`${BASE}${page}`, {
      headers: { Cookie: sessionCookie },
      redirect: "manual",
    });
    assert(res.status === 200, `GET ${page} returns 200`, `got ${res.status}`);
  }

  const clients = (await request("GET", "/api/clients")).data;
  const cons = (await request("GET", "/api/consultations")).data;
  if (clients?.[0]) {
    const r = await fetch(`${BASE}/clients/${clients[0].id}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(r.status === 200, "Client detail page returns 200");
  }
  if (cons?.[0]) {
    const r = await fetch(`${BASE}/consultations/${cons[0].id}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(r.status === 200, "Consultation detail page returns 200");
  }

  const badClient = await fetch(`${BASE}/clients/invalid-id-xyz`, {
    headers: { Cookie: sessionCookie },
  });
  assert(badClient.status === 200, "Invalid client page renders (SPA)");
}

async function testDashboard() {
  console.log("\n=== DASHBOARD API ===");
  const { status, data } = await request("GET", "/api/dashboard");
  assert(status === 200, "Dashboard returns 200");
  assert(typeof data.totalClients === "number", "totalClients is number");
  assert(typeof data.scheduledCount === "number", "scheduledCount is number");
  assert(typeof data.completedCount === "number", "completedCount is number");
  assert(typeof data.pendingPaymentsCount === "number", "pendingPaymentsCount is number");
  assert(typeof data.totalRevenue === "number", "totalRevenue is number");
  assert(data.totalRevenue >= 0, "totalRevenue is non-negative");
  assert(Array.isArray(data.todayConsultations), "todayConsultations is array");
  assert(Array.isArray(data.upcomingConsultations), "upcomingConsultations is array");
  assert(Array.isArray(data.recentClients), "recentClients is array");

  const allClients = (await request("GET", "/api/clients")).data;
  assert(data.totalClients === allClients.length, "Dashboard client count matches list");
}

async function testSeedDataIntegrity() {
  console.log("\n=== SEED DATA INTEGRITY ===");
  const res = await request("GET", "/api/clients");
  assert(res.data.length >= 4, "Seed has at least 4 clients", `found ${res.data?.length}`);

  const priya = res.data.find((c) => c.name === "Priya Sharma");
  assert(priya, "Seed client Priya Sharma exists");
  assert(priya._count.consultations >= 1, "Priya has consultations");

  const consultations = await request("GET", "/api/consultations");
  assert(consultations.data.length >= 4, "Seed has consultations");

  const paid = consultations.data.filter((c) => c.paymentStatus === "paid");
  assert(paid.length >= 1, "Seed has paid consultations");
  assert(paid.every((c) => c.fee !== null && c.fee > 0), "Paid consultations have fees");

  const pending = consultations.data.filter((c) => c.paymentStatus === "pending");
  assert(pending.length >= 1, "Seed has pending payments");
}

async function testClientsCRUD() {
  console.log("\n=== CLIENTS CRUD ===");

  let res = await request("GET", "/api/clients");
  assert(res.status === 200, "GET /api/clients returns 200");
  assert(Array.isArray(res.data), "Clients list is array");

  res = await request("GET", "/api/clients?search=Priya");
  assert(res.status === 200 && res.data.length >= 1, "Search finds Priya");

  res = await request("GET", "/api/clients?search=nonexistent_xyz_123");
  assert(res.data.length === 0, "Empty search returns no results");

  res = await request("POST", "/api/clients", { name: "  " });
  assert(res.status === 400, "Empty name returns 400");

  res = await request("POST", "/api/clients", {
    name: "QA Test Client",
    phone: "+91 99999 00001",
    email: "qa.test@example.com",
    birthDate: "1990-05-15",
    birthTime: "08:30",
    birthPlace: "Bangalore, Karnataka",
    tags: "qa-test",
    notes: "Created by QA script",
  });
  assert(res.status === 201, "Create client returns 201");
  const clientId = res.data.id;

  res = await request("GET", `/api/clients/${clientId}`);
  assert(res.status === 200 && res.data.name === "QA Test Client", "GET client by id works");

  res = await request("GET", "/api/clients/invalid-id-xyz");
  assert(res.status === 404, "GET invalid client returns 404");

  res = await request("PUT", `/api/clients/${clientId}`, {
    name: "QA Test Client Updated",
    phone: "+91 99999 00002",
    email: "qa.updated@example.com",
    birthDate: "1991-06-20",
    birthTime: "09:00",
    birthPlace: "Chennai",
    tags: "updated",
    notes: "Updated",
  });
  assert(res.status === 200 && res.data.name === "QA Test Client Updated", "Update client works");

  res = await request("PUT", `/api/clients/${clientId}`, { name: "" });
  assert(res.status === 400, "Update with empty name returns 400");

  return clientId;
}

async function testConsultationsCRUD(clientId) {
  console.log("\n=== CONSULTATIONS CRUD ===");

  let res = await request("GET", "/api/consultations");
  assert(res.status === 200 && Array.isArray(res.data), "List consultations works");

  res = await request("GET", "/api/consultations?status=scheduled");
  assert(res.data.every((c) => c.status === "scheduled"), "Status filter works");

  res = await request("GET", "/api/consultations?paymentStatus=pending");
  assert(res.status === 200, "Payment status filter returns 200");
  assert(res.data.every((c) => c.paymentStatus === "pending"), "Payment filter correct");

  res = await request("GET", "/api/consultations?paymentStatus=paid");
  assert(res.data.every((c) => c.paymentStatus === "paid"), "Paid filter correct");

  res = await request("POST", "/api/consultations", {});
  assert(res.status === 400, "Create without clientId returns 400");

  res = await request("POST", "/api/consultations", { clientId });
  assert(res.status === 400, "Create without scheduledAt returns 400");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);

  res = await request("POST", "/api/consultations", {
    clientId,
    scheduledAt: tomorrow.toISOString().slice(0, 16),
    duration: 45,
    type: "horoscope",
    status: "scheduled",
    sessionNotes: "QA notes",
    fee: 2500,
    paymentStatus: "pending",
    paymentMethod: "upi",
    paymentNotes: "To be collected",
  });
  assert(res.status === 201, "Create consultation with payment returns 201");
  assert(res.data.fee === 2500, "Fee saved");
  assert(res.data.paymentStatus === "pending", "Payment status saved");
  assert(res.data.paymentMethod === "upi", "Payment method saved");
  const consultationId = res.data.id;

  res = await request("GET", `/api/consultations/${consultationId}`);
  assert(res.status === 200 && res.data.fee === 2500, "GET includes payment fields");

  res = await request("PUT", `/api/consultations/${consultationId}`, {
    paymentStatus: "paid",
    fee: 2500,
  });
  assert(res.status === 200, "Mark paid returns 200");
  assert(res.data.paymentStatus === "paid", "Payment status updated to paid");
  assert(res.data.paidAt !== null, "paidAt auto-set on mark paid");

  res = await request("PUT", `/api/consultations/${consultationId}`, {
    scheduledAt: "2026-12-05T14:00:00",
    duration: 90,
    type: "career",
    status: "completed",
    sessionNotes: "Updated notes",
    fee: 3000,
    paymentStatus: "partial",
    paymentMethod: "cash",
    paymentNotes: "₹1500 received",
  });
  assert(res.status === 200, "Full update works");
  assert(res.data.status === "completed", "Status updated");
  assert(res.data.fee === 3000, "Fee updated");
  assert(res.data.paymentStatus === "partial", "Partial payment saved");

  res = await request("PUT", `/api/consultations/${consultationId}`, { sessionNotes: "" });
  assert(res.data.sessionNotes === null, "Empty notes stored as null");

  return consultationId;
}

async function testDeleteAndLogout(clientId, consultationId) {
  console.log("\n=== DELETE & LOGOUT ===");

  let res = await request("DELETE", `/api/consultations/${consultationId}`);
  assert(res.status === 200, "Delete consultation works");

  res = await request("GET", `/api/consultations/${consultationId}`);
  assert(res.status === 404, "Deleted consultation returns 404");

  res = await request("DELETE", `/api/clients/${clientId}`);
  assert(res.status === 200, "Delete client works");

  res = await request("GET", `/api/clients/${clientId}`);
  assert(res.status === 404, "Deleted client returns 404");

  res = await request("DELETE", "/api/auth");
  assert(res.status === 200, "Logout returns 200");

  sessionCookie = "";
  res = await fetch(`${BASE}/api/clients`);
  assert(res.status === 401, "API blocked without session after logout");

  const relogin = await login();
  assert(relogin.status === 200, "Re-login after logout works");
}

async function main() {
  console.log("Astrologer CRM — Full QA Suite");
  console.log(`Target: ${BASE}`);
  console.log(`Date: ${new Date().toISOString()}`);

  try {
    await fetch(BASE);
  } catch {
    console.error("\nERROR: Server not running at", BASE);
    console.error("Start with: npm run dev");
    process.exit(1);
  }

  await testAuth();
  await testPages();
  await testDashboard();
  await testSeedDataIntegrity();
  const clientId = await testClientsCRUD();
  const consultationId = await testConsultationsCRUD(clientId);
  await testDeleteAndLogout(clientId, consultationId);

  console.log("\n=== SUMMARY ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }

  console.log("\nAll tests passed.");
}

main();
