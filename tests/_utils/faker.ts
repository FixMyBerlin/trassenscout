import { fakerDE as faker } from "@faker-js/faker"

// Docs: https://fakerjs.dev/guide/usage.html

export const fakeEmail = () => {
  return `playwright-${faker.internet.email()}`
}

export const fakeFirstname = () => {
  return `${faker.person.firstName()} (Playwright)`
}

export const fakeLastname = () => {
  return `${faker.person.lastName()} (Playwright)`
}

export const fakeTextarea = (numParagraphs: number = 2) => {
  return `Playwright: ${faker.lorem.paragraphs(numParagraphs)}`
}

export const fakeInt = () => {
  return faker.number.int()
}
