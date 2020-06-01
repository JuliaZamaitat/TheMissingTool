describe("The Home Page", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("shows a button to create a new board", () => {
		cy.contains("Create a new board");
	});

	it("redirects to a new board on button click", () => {
		cy.contains("Create a new board").click();
		cy.url().should("include", "/board/");
	});
});
