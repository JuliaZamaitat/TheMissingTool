/// <reference types="cypress" />

describe("The Shape", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("Shape Test", function () {
		cy.title().should("eq", "The Missing Tool");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .colorChangeBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").should("be.not.visible");
		cy.get("#user-name").clear();
		cy.get("#user-name").type("Alain").click();
	});
	it("Toolbar", function () {
	});
	/*it("On Board", function () {
		//cy.get("input[id=board-name]").contains("My Board").should("be.visible");
		cy.url().should("include", "5f");
		cy.title().should("eq", "The Missing Tool");
		cy.get("#SQUARE").click();
		//cy.get("#\\35 f004b4ff44df9366cd60665 > textarea").type("Hello World");
		cy.get("#35 f06b3c3c9551800049b51d4 >.buttonContainer").click();
		cy.get("#RECTANGLE").click();
		cy.get("\t\t#\\35 f06b3c3c9551800049b51d4 > div.neu-float-panel.buttonContainer > span.neu-button.plain.link\n").click();
		//cy.get("input[type=\"text\"]").type("Hello World");
		cy.get(".visitorContainer").find("[contenteditable]").type("Hello Word");
		cy.get("\t\t#\\35 f06b3c3c9551800049b51d4 > div.neu-float-panel.buttonContainer > span.neu-button.plain.link\n").click();
		cy.get("#CIRCLE").click().type("Ich bin eine Karte");
		cy.get("#TRIANGLE").click();
		cy.get("#ELLIPSE").click();
		/*cy.get(".menu-btn").first().click();
		cy.get("#board-name-input-modal").type("M");
		cy.contains("Create", {timeout: 2000}).should("be.visible").click();
	});*/
});
