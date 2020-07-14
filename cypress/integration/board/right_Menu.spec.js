/// <reference types="cypress" />

describe("Board", function () {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board");
	});
	it("Create Board-Test", ()=> {
		cy.url().should("include", "board");
		cy.title().should("eq", "The Missing Tool");
		cy.get("#create-board").contains("Create a new board").should("be.visible").click();
		cy.url().should("include", "board");
		cy.get("input[placeholder=\"Type a name...\"]").type("My Board", {timeout:100000});
		cy.contains("Create").should("be.visible").last().click();
		cy.get("#user-name").clear();
		cy.get("#user-name").type("Brahe").click();
		cy.get("#menubar").click();
		cy.get("#menubar > button:nth-child(4)").click();
		cy.contains("All the cards on the board will be lost.").should("be.visible");
		cy.get("#exampleModalLabel").contains("Are you sure you want to delete this card?")
		//cy.get("#deleteBoardModal > div > div > div.modal-footer > button.neu-button.plain").first().click({force:true});
		cy.get("\t\t#delete-board\n").click();
		cy.contains("All the cards on the board will be lost.").should("be.not.visible");
		cy.url().should("include", "board");
		cy.contains("Last seen").should("be.visible");
	});
});
