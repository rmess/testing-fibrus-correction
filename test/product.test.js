import chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import Product from "../models/Product.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("TDD - Product API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  let productId;

  it("Devrait créer un produit avec des données valides", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Café Arabica",
      price: 15.99,
      stock: 50,
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Café Arabica");
    productId = res.body._id;
  });

  it("Ne devrait pas créer un produit sans prix", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Thé Noir",
      stock: 30,
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("Devrait récupérer tous les produits", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("Devrait récupérer un produit par ID", async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("name", "Café Arabica");
  });

  it("Devrait mettre à jour le stock d'un produit", async () => {
    const res = await request(app).put(`/api/products/${productId}`).send({
      stock: 100,
    });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("stock", 100);
  });

  it("Devrait renvoyer une erreur 404 si un produit n'existe pas", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Produit non trouvé");
  });

  it("Devrait supprimer un produit existant", async () => {
    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Produit supprimé");
  });
});
