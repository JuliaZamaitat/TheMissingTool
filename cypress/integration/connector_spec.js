describe("The Connectors", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("clicks connect and aborts", () => {
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").trigger("mousedown", {which: 1});
		cy.document().trigger("mousemove", {clientX: 0, clientY: 0})
		cy.get("#temp").should("be.visible");
		cy.get("#main-container").trigger("mousedown", {which: 1});
		cy.get("#temp").should("be.not.visible");
	});

	it("connects two cards", () => {
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").trigger("mousedown", {which: 1});
		cy.get("#22cb32bde3464f14678922ca").click();
		cy.get(".line[data-from='32cb31bde3464f14678934ca'][data-to='22cb32bde3464f14678922ca']").should("be.visible");
	});

	it("deletes card and associated line", () => {
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").click();
		cy.get(".line[data-from='32cb31bde3464f14678934ca'], .line[data-to='32cb31bde3464f14678934ca']").should("not.exist");
	});
});
