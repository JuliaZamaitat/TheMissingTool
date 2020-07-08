/// <reference types="Cypress" />
describe("Board", function () {
	before(() => {
		cy.visit("http://the-missing-tool.herokuapp.com/board");
	});
	it("Board-Test", function () {
		cy.url().should("include", "board");
		cy.title().should("eq", "The Missing Tool");
		cy.get("#create-board").contains("Create a new board").should("be.visible").click();
		cy.url().should("include", "board");
		cy.get("input[placeholder=\"Type a name...\"]").type("My Board");
		//cy.contains("Create").should("be.visible").click({force:true});
		cy.contains("Create", {timeout:10000}).should("be.visible").last().click();
	});
	it("On Board", function () {
		//cy.get("input[id=board-name]").contains("My Board").should("be.visible");
		cy.url().should("include", "5f");
		cy.title().should("eq", "The Missing Tool");
		cy.get("#SQUARE").click();
		//cy.get("#\\35 f004b4ff44df9366cd60665 > textarea").type("Hello World");
		cy.get("#RECTANGLE").click();
		cy.get("input[type=\"text\"]").type("Hello World");
		cy.get("#CIRCLE").click().type("Ich bin eine Karte");
		cy.get("#TRIANGLE").click();
		cy.get("#ELLIPSE").click();
		/*cy.get(".menu-btn").first().click();
		cy.get("#board-name-input-modal").type("M");
		cy.contains("Create", {timeout: 2000}).should("be.visible").click();*/
	});
});
