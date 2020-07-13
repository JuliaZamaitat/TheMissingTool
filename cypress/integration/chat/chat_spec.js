describe("The Chat", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("shows the chat header", () => {
		cy.get("#chatHeader").should("contain", "Chat");
	});
	it("does not show hidden chat content", () => {
		cy.get("#chatContent").should("be.not.visible");
	});
	it("shows chat content after click on open chat button", () => {
		cy.get("#open-chat").click();
		cy.get("#chatContent").should("be.visible");
	});
	it("hides chat content after click on chat Header", () => {
		cy.get("#chatHeader").click();
		cy.get("#chatContent").should("be.visible");
	});
	it("appends messages to chat", () => {
		cy.get("#chatContent").should("contain", "Hanz Franz");
		cy.get("#chatContent").should("contain", "Some message");
		cy.get("#chatContent").should("not.contain", "Some other username");
		cy.get("#chatContent").should("not.contain", "Some other message");
	});
	it("hides chat content when clicking on close button", () => {
		cy.get("#close-chat").click();
		cy.get("#chatContent").should("be.not.visible");
	});
});
