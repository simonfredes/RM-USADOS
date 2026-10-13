import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
async function revealPage(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) { await page.evaluate((top) => window.scrollTo(0, top), y); await page.waitForTimeout(70); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}
async function stock(request: APIRequestContext) {
  await request.put("http://127.0.0.1:54329/__fixtures?mode=stock");
}

test.beforeEach(async ({ page, request }) => {
  await request.put("http://127.0.0.1:54329/__fixtures?mode=empty");
  // Serve local reference assets only inside the browser test; never loosen Next's production image security.
  await page.route("**/_next/image?*", async (route) => {
    const imageUrl = new URL(route.request().url()).searchParams.get("url") || "";
    if (!imageUrl.startsWith("http://127.0.0.1:54329/")) return route.continue();
    if (imageUrl.endsWith("broken.png")) return route.abort();
    const image = imageUrl.endsWith("sedan.png") ? "featured-sedan.png" : "featured-suv.png";
    await route.fulfill({ contentType: "image/png", body: await readFile(`public/images/${image}`) });
  });
});

test("home: typography, visual hierarchy, screenshots and no overflow", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Encontrá tu próximo auto.");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Inter");
  expect(await page.evaluate(() => [...document.fonts].some((font) => font.status === "loaded"))).toBe(true);
  const heroImage = page.locator(".hero-image");
  await expect.poll(() => heroImage.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  // The image itself scales during its entrance animation; its frame defines the full-bleed area.
  const imageBounds = await page.locator(".hero-visual").boundingBox();
  expect(imageBounds!.x).toBe(0);
  expect(imageBounds!.width).toBe(page.viewportSize()!.width);
  await expect(page.getByRole("button", { name: "Buscar autos", exact: true })).toBeInViewport();
  if (page.viewportSize()!.width >= 1024) {
    const search = page.getByRole("search", { name: "Buscar vehículos" });
    await expect(search.getByRole("button", { name: "Más filtros", exact: true })).toBeHidden();
    const controls = await search.locator("input, select, button[type=submit]").all();
    const positions = await Promise.all(controls.map(async (control) => (await control.boundingBox())!.y));
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
    expect((await search.boundingBox())!.height).toBeLessThan(160);
  }
  await expect(page.getByText("Imágenes de referencia · No representan stock disponible")).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("home-hero.png") });
  await revealPage(page);
  await page.screenshot({ path: testInfo.outputPath("home-full.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("hero search transfers combined filters and quick searches to the catalog", async ({ page, request, browserName }) => {
  await stock(request);
  await page.goto("/");
  const search = page.getByRole("search", { name: "Buscar vehículos" });
  await search.getByRole("searchbox").fill("GLE");
  const filtersToggle = search.getByRole("button", { name: "Más filtros", exact: true });
  if (await filtersToggle.isVisible()) {
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(filtersToggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "true");
  }
  await search.getByRole("combobox", { name: "Marca", exact: true }).selectOption("Mercedes-Benz");
  await search.getByRole("combobox", { name: "Carrocería", exact: true }).selectOption("SUV");
  if (await filtersToggle.isVisible()) {
    await filtersToggle.click();
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "false");
    await expect(search.getByRole("combobox", { name: "Marca", exact: true })).toBeHidden();
  }
  await search.getByRole("button", { name: "Buscar autos" }).click();
  await expect(page).toHaveURL(/carroceria=SUV/);
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-name")).toContainText("GLE 450");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Carrocería", exact: true })).toHaveValue("SUV");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Búsquedas rápidas" }).getByRole("link", { name: "BMW", exact: true }).click();
  await expect(page).toHaveURL(/\/vehiculos\?marca=BMW$/);
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-name")).toHaveText("Serie 8");
  await page.goto("/");
  await page.getByRole("navigation", { name: "Búsquedas rápidas" }).getByRole("link", { name: "SUV", exact: true }).click();
  await expect(page).toHaveURL(/\/vehiculos\?carroceria=SUV$/);
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-name")).toContainText("GLE 450");
});

test("mobile menu: focus trap, Escape, navigation and scroll restoration", async ({ page }) => {
  test.skip((test.info().project.use.viewport?.width || 1440) >= 1024, "Mobile navigation only");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Abrir menú" });
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "RM Usados · Menú" });
  await expect(menu).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar menú" })).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true); }
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(toggle).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await toggle.click();
  await menu.getByRole("link", { name: "Nosotros" }).click();
  await expect(menu).not.toBeVisible();
  await expect(page).toHaveURL(/#nosotros$/);
  await expect(page.getByRole("heading", { name: "Autos elegidos con criterio." })).toBeInViewport();
});

test("mobile menu remains usable in landscape and closes at desktop breakpoint", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile-chromium", "Single breakpoint check");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const menu = page.getByRole("dialog");
  await expect(menu.getByRole("link", { name: "Hablar por WhatsApp" })).toBeInViewport();
  await assertNoOverflow(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("empty catalog and recovery through contact", async ({ page }) => {
  await page.goto("/vehiculos");
  await expect(page.getByRole("status")).toHaveText("0 resultados");
  await expect(page.getByRole("heading", { name: "Las buenas elecciones merecen una conversación." })).toBeVisible();
  await page.getByRole("link", { name: "Hablemos de tu próximo auto" }).click();
  await expect(page).toHaveURL(/#contacto$/);
  const contact = page.locator("#contacto");
  await expect(contact.getByRole("heading")).toBeInViewport();
  const whatsapp = contact.getByRole("link", { name: "Coordiná una visita" });
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  await expect(contact.getByRole("link", { name: /2914/ })).toHaveAttribute("href", /^tel:/);
  await expect(contact.getByRole("link", { name: "contacto@rmusados.com.ar" })).toHaveAttribute("href", /^mailto:/);
  await assertNoOverflow(page);
});

test("keyboard skip link and visible focus", async ({ page, browserName }) => {
  await page.goto("/");
  // Safari's default macOS setting uses Option+Tab to include hyperlinks.
  const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(tab);
  const skip = page.getByRole("link", { name: "Ir al contenido" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.keyboard.press(tab);
  const outline = await page.evaluate(() => document.activeElement ? getComputedStyle(document.activeElement).outlineStyle : "none");
  expect(outline).not.toBe("none");
});

test("reduced motion: all sections remain visible without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator(".reveal-pending").count()).toBe(0);
  expect(await page.locator(".hero-title").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await page.locator(".hero-visual").evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect(page.locator("#contacto h2")).toBeVisible();
  await assertNoOverflow(page);
});

test("WCAG 2.2 AA: home, empty catalog and mobile dialog", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/vehiculos"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  }
  if ((test.info().project.use.viewport?.width || 1440) < 1024) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  }
});

test("@catalog published cards, long content, image fallbacks and screenshot", async ({ page, request }, testInfo) => {
  await stock(request);
  await page.goto("/vehiculos", { waitUntil: "networkidle" });
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await expect(page.getByRole("status")).toHaveText("4 resultados");
  await expect(page.getByRole("img", { name: /BMW Serie 8.*Imagen no disponible/ })).toBeVisible();
  await page.getByRole("heading", { name: "911 Carrera", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("img", { name: /Porsche 911 Carrera.*Imagen no disponible/ })).toBeVisible();
  await expect(page.getByText("USD 123.456.789")).toBeVisible();
  await expect(page.getByRole("list", { name: "Destacados" }).first().getByRole("listitem")).toHaveText(["245 CV", "Única mano"]);
  await assertNoOverflow(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".site-header")).not.toHaveClass(/is-scrolled/);
  await page.screenshot({ path: testInfo.outputPath("catalog-full.png"), fullPage: true });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("@catalog search, brand, sorting, URL persistence and empty-search recovery", async ({ page, request }) => {
  await stock(request);
  await page.goto("/vehiculos");
  const query = page.getByRole("searchbox", { name: "Buscá tu próximo auto" });
  await query.fill("audi");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=audi/);
  await page.reload();
  await expect(query).toHaveValue("audi");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("combobox", { name: "Marca", exact: true }).selectOption("BMW");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-name")).toHaveText("Serie 8");
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("combobox", { name: "Ordenar por" }).selectOption("year");
  await expect(page.locator(".vehicle-name").first()).toContainText("GLE 450");
  await page.getByRole("combobox", { name: "Ordenar por" }).selectOption("mileage");
  await expect(page.locator(".vehicle-name").first()).toHaveText("911 Carrera");
  await expect(page.locator(".vehicle-name").last()).toHaveText("Serie 8");
  await query.fill("modelo-inexistente");
  await expect(page.getByRole("status")).toHaveText("0 resultados");
  await page.getByRole("button", { name: "Ver todas las unidades" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await expect(page).toHaveURL("/vehiculos");
});

test("@catalog budget, model, advanced filters, chips and price sorting", async ({ page, request }) => {
  await stock(request);
  await page.goto("/vehiculos?presupuesto=50000-80000");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".vehicle-name")).toHaveText("A6");
  await page.getByRole("combobox", { name: "Presupuesto (USD)" }).selectOption("120000-");
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("combobox", { name: "Marca", exact: true }).selectOption("Porsche");
  await page.getByRole("combobox", { name: "Modelo" }).selectOption("911 Carrera");
  await expect(page).toHaveURL(/modelo=911/);
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByRole("combobox", { name: "Marca", exact: true }).selectOption("Audi");
  await expect(page.getByRole("combobox", { name: "Modelo" })).toHaveValue("");
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  const more = page.getByRole("button", { name: /Más filtros/ });
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await more.click();
  await page.getByRole("combobox", { name: "Año desde" }).selectOption("2023");
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Quitar filtro Desde 2023" }).click();
  await page.getByRole("combobox", { name: "Kilometraje" }).selectOption("20000");
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Kilometraje" })).toBeVisible();
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("combobox", { name: "Ordenar por" }).selectOption("price-asc");
  await expect(page.locator(".vehicle-name").first()).toHaveText("A6");
  await expect(page.locator(".vehicle-name").last()).toHaveText("Serie 8");
  await assertNoOverflow(page);
});

test("@catalog BMW leads every brand list", async ({ page, request }) => {
  await stock(request);
  await page.goto("/");
  const heroBrands = page.getByRole("search", { name: "Buscar vehículos" }).locator("select[name=marca] option"); // collapsed on mobile
  await expect(heroBrands.nth(1)).toHaveText("BMW");
  await expect(page.getByRole("navigation", { name: "Búsquedas rápidas" }).getByRole("link").first()).toHaveText("BMW");
  await page.goto("/vehiculos");
  const catalogBrands = await page.getByRole("combobox", { name: "Marca", exact: true }).locator("option").allTextContents();
  expect(catalogBrands).toEqual(["Todas", "BMW", "Audi", "Mercedes-Benz", "Porsche"]);
});

test("@catalog selected vehicle arrives in the WhatsApp inquiry", async ({ page, request }) => {
  await stock(request);
  await page.goto("/vehiculos");
  await page.getByRole("link", { name: "Consultar por Audi A6" }).click();
  await expect(page.locator(".contact-selected")).toContainText("Audi A6");
  const href = await page.locator("#contacto").getByRole("link", { name: "Coordiná una visita" }).getAttribute("href");
  expect(new URL(href!).searchParams.get("text")).toContain("Audi A6 45 TFSI quattro");
  await assertNoOverflow(page);
});

test("@catalog vehicle detail: card link, gallery, SEO metadata, related and 404", async ({ page, request }) => {
  await stock(request);
  await page.goto("/vehiculos");
  await page.getByRole("link", { name: "A6", exact: true }).click();
  await expect(page).toHaveURL(/\/autos\/audi-a6-45-tfsi-2023$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Audi A6");
  await expect(page).toHaveTitle("Audi A6 45 TFSI quattro · Unidad de prueba 2023 usado | RM Usados");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/autos\/audi-a6-45-tfsi-2023$/);
  const structured = await page.locator('script[type="application/ld+json"]').first().textContent();
  const car = JSON.parse(structured!)[0];
  expect(car["@type"]).toBe("Car");
  expect(car.image).toHaveLength(3);
  expect(car.mileageFromOdometer.value).toBe(18500);
  expect(car.offers.price).toBe(68000);
  const gallery = page.getByRole("region", { name: /Fotos del Audi A6/ });
  await expect(gallery.locator(".gallery-main").getByText("1 / 3")).toBeVisible();
  await gallery.locator(".gallery-main").getByRole("button", { name: "Foto siguiente" }).click();
  await expect(gallery.locator(".gallery-main").getByText("2 / 3")).toBeVisible();
  await gallery.getByRole("button", { name: "Ver foto 3 de 3" }).click();
  await expect(gallery.getByRole("button", { name: "Ver foto 3 de 3" })).toHaveAttribute("aria-current", "true");
  await gallery.getByRole("button", { name: "Ver fotos en pantalla completa" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  const whatsapp = await page.getByRole("link", { name: "Consultar por WhatsApp" }).getAttribute("href");
  expect(new URL(whatsapp!).searchParams.get("text")).toContain("/autos/audi-a6-45-tfsi-2023");
  // Sedanes primero; entre ellos gana el Porsche por kilometraje similar. La SUV queda última.
  const relatedRegion = page.getByRole("region", { name: "Vehículos similares." });
  const related = relatedRegion.locator(".vehicle-card");
  await expect(related.locator(".vehicle-name")).toHaveText(["911 Carrera", "Serie 8", /GLE 450/]);
  await assertNoOverflow(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  // Sin slug en la base, la unidad se publica por su id.
  await relatedRegion.getByRole("link", { name: "Serie 8", exact: true }).click();
  await expect(page).toHaveURL(/\/autos\/fixture-bmw$/);
  expect((await request.get("/autos/no-existe")).status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/autos/audi-a6-45-tfsi-2023");
  expect(sitemap).toContain("<image:loc>");
});

test("@catalog published home uses actual stock instead of reference cards", async ({ page, request }) => {
  await stock(request);
  await page.goto("/");
  await expect(page.locator("#vehiculos .vehicle-card")).toHaveCount(3);
  await expect(page.getByText("Unidades destacadas")).toBeVisible();
  await expect(page.getByText("Imágenes de referencia · No representan stock disponible")).toHaveCount(0);
});

test("admin and authentication routes have been removed", async ({ request }) => {
  for (const path of ["/admin", "/login", "/recuperar-contrasena", "/actualizar-contrasena", "/auth/callback"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

test("responsive transitions: 320 to 1440 px, home and populated catalog", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One complete width sweep");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 360, 390, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
    await request.put("http://127.0.0.1:54329/__fixtures?mode=empty");
    await page.goto("/");
    await assertNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    await stock(request);
    await page.goto("/vehiculos", { waitUntil: "networkidle" });
    await expect(page.locator(".vehicle-card")).toHaveCount(4);
    await assertNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`catalog-${width}.png`), fullPage: true });
  }
});
