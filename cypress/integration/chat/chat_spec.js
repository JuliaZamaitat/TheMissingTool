
describe("The Chat", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("shows the open-chat button", () => {
		cy.get("#open-chat").should("be.visible");
	});

	it("shows chat window after click on open chat button", () => {
		cy.get("#open-chat").click();
		cy.get("#chatWindow").should("be.visible");
		cy.get("#chatHeader").should("be.visible");
		cy.get("#chatBody").should("be.visible");
	});

	it("chatHeader contains content", () => {
		cy.get("#user-list-button").should("be.visible");
		cy.get("#close-chat").should("be.visible");
	});

	it("chatBody contains content", () => {
		cy.get("#chatContent").should("be.visible");
		cy.get("#chatInputContainer").should("be.visible");
	});

	it("shows user list", () => {
		cy.get("#user-list-button").trigger("mouseover");
		cy.get(".pop-user-list").should("be.visible");
		//cy.get(".pop-user-list").should("contain", "Francesco Russel");
	});

	it("appends messages to chat", () => {
		cy.get("#chatContent").should("contain", "Hanz Franz");
		cy.get("#chatContent").should("contain", "Some message");
		cy.get("#chatContent").should("not.contain", "Some other username");
		cy.get("#chatContent").should("not.contain", "Some other message");
	});

	it("send new message", () => {
		cy.get("#chatInput").type("hello, world! {enter}");
		cy.get("#chatContent").should("contain", "hello, world!");
	});

	it("hides chat content when clicking on close button", () => {
		cy.get("#close-chat").click();
		cy.get("#chatContent").should("be.not.visible");
	});

	/*
	it("shows the chat header", () => {
		cy.get("#chatHeader").should("contain", "Chat");
	});
	it("does not show hidden chat content", () => {
		cy.get("#chatContent").should("be.not.visible");
	});
	it("hides chat content after click on chat Header", () => {
		cy.get("#chatHeader").click();
		cy.get("#chatContent").should("be.visible");
	});



	 */
});
