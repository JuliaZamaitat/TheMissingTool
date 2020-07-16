describe("Board", function () {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board");
	});
	it("Create Board-Test", function () {
		cy.url().should("include", "board");
		cy.title().should("eq", "The Missing Tool");
		cy.get("#create-board").contains("Create a new board").should("be.visible").click();
		cy.url().should("include", "board");
		cy.get("input[placeholder=\"Type a name...\"]").type("My Board", {timeout:100000});
		//cy.contains("Create").should("be.visible").click({force:true});
		cy.contains("Create").should("be.visible").last().click();
		cy.get("#user-name").clear();
		cy.get("#user-name").type("Brahe").click();
		cy.url().should("include", "5f");
		cy.get("#SQUARE").click();
		cy.go(-1);
	});
});
