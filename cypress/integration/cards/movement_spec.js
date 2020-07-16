describe("The Card Movement", () => {
	before(() => {
		cy.viewport(1000, 1000);
		cy.exec("npm run db:seed");
		cy.visit("/board/56cb91bdc3464f14678934ca");
	});

	it("should move card with mousemove", () => {
		cy.get("#32cb31bde3464f14678934ca").should("have.css", "left", "450px")
			.should("have.css", "top", "230px");

		moveCard("#32cb31bde3464f14678934ca", -20, -500);

		cy.get("#32cb31bde3464f14678934ca").should("have.css", "left", "120px")
			.should("not.have.css", "top", "230px");
	});

	function moveCard(id, x, y) {
		cy.get(id)
			.trigger("mousedown", {which: 1})
			.trigger("mousemove", {clientX: x, clientY: y})
			.trigger("mouseup", {force: true});
	}
});
