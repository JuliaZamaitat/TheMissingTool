/// <reference types="cypress" />

describe("Create Shape", () => {
	before(() => {
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("Shape Test", function () {
		cy.title().should("eq", "The Missing Tool");
		cy.url().should("include", "56cb91");
		cy.get("#user-name").clear();
		cy.get("#user-name").type("Bruno").click();
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .colorChangeBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").should("be.not.visible");
		cy.get("#32cb31bde3464f14678934ca > textarea").clear();
		cy.get("#32cb31bde3464f14678934ca > textarea").click().type("Welcome to our Meeting");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .colorChangeBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .connectBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .commentBtn").should("be.visible");
		cy.get("#32cb31bde3464f14678934ca > .buttonContainer > .deleteBtn").should("be.visible");
		cy.get("#22cb32bde3464f14678922ca > textarea").clear();
		cy.get("#22cb32bde3464f14678922ca > textarea").click().type("my Name is Bruno");
	});
	it("Toolbar", function () {
		cy.get("#TRIANGLE").click();
		cy.get("#SQUARE").click();
		cy.get("#ELLIPSE").click();
		cy.get("#CIRCLE").click();
		cy.get("#RECTANGLE").click();
	});
});
