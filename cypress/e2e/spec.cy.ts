describe('My First Test', () => {
    it('Visits the initial project page', () => {
        cy.visit('/')
        cy.contains('Deppi') // Or appropriate text
    })
})
