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

	it("deletes connector", () => {
		cy.get(".line[data-from='32cb31bde3464f14678934ca'][data-to='22cb32bde3464f14678922ca']").first().trigger("mouseover");
		cy.get("#deleteConnectorBtn").should("be.visible");
		cy.get("#deleteConnectorBtn").click();
		cy.get("#deleteConnectorBtn").should("be.not.visible");
		cy.get(".line[data-from='32cb31bde3464f14678934ca'][data-to='22cb32bde3464f14678922ca']").should("be.not.visible");
	});
});
