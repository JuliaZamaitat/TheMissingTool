/// <reference types="cypress" />

describe("The Shape", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("Shape Test", function () {
		cy.title().should("eq", "The Missing Tool");
		cy.get("#SQUARE").click();
		cy.get("#\\35 f004b4ff44df9366cd60665 > textarea").type("Hello World");
		cy.get("#RECTANGLE").click();
		cy.get("#CIRCLE").click();
		cy.get("#TRIANGLE").click();
		cy.get("#ELLIPSE").click();
	});
});
