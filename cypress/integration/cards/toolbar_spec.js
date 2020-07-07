describe("The Card Toolbar", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("shows the card toolbar with all elements", () => {
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .colorChangeBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .colorChangeBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").click();
		cy.get("#32cb31bde3464f14678934ca").should("not.exist");
	});

	it("shows the side toolbar", () => {
		cy.get("#toolbar > .toolbar-btn").should("be.visible");
		cy.get("#toolbar > #SQUARE").should("have.css", "width", "32.5px");
	});
});
