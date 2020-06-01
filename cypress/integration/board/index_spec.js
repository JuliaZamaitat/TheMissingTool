
describe("The Board Index Page", () => {
	//Cypress.Cookies.debug(true);
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("shows the name of the board", () => {
		cy.get("#board-name").should("have.value", "Cooles Board");
	});

	it("shows the text of the cards", () => {
		cy.get("#32cb31bde3464f14678934ca > textarea").should("have.value", "Ich bin eine tolle Karte");
		cy.get("#22cb32bde3464f14678922ca > textarea").should("have.value", "Ich bin eine noch tollere Karte");
	});

	it("shows the username", () => {
		let username = document.cookie
			.split("; ")
			.find(row => row.startsWith("username"))
			.split("=")[1];
		username = decodeURI(username);
		cy.get("#user-name").should("have.value", username);
	});

	it("shows the chat window", () => {
		cy.get("#chatWindow");
	});

	it("shows the menubar", () => {
		cy.get("#menubar");
	});

	it("shows the toolbar", () => {
		cy.get("#toolbar");
	});

});
