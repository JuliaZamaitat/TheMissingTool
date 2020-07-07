describe("The Card Comments", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("shows the card toolbar", () => {
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.visible");
	});

	it("shows the comment box", () => {
		cy.get("#32cb31bde3464f14678934ca > .comments-box").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > textarea").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").trigger("mousedown", {which: 1});
		cy.get("#32cb31bde3464f14678934ca > .comments-box").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "User1");
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "Hi there");
	});
	it("loads the comments", () => {
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "User1");
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "Hi there");
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "User2");
		cy.get("#32cb31bde3464f14678934ca > .comments-box > .commentField").should("contain", "Hi back");
	});
});
