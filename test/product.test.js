import chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import Product from "../models/Product.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("Product API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  let productId;

  it("Devrait créer un produit", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Thé Vert Bio",
      price: 12.99,
      stock: 100
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Thé Vert Bio");
    expect(res.body).to.have.property("price", 12.99);
    expect(res.body).to.have.property("stock", 100);
    productId = res.body._id;
  });

  it("Devrait récupérer tous les produits", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("Devrait récupérer un produit par ID", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("name", "Thé Vert Bio");
  });

  it("Devrait mettre à jour un produit", async () => {
    const res = await request(app).put(`/api/products/${productId}`).send({
      price: 14.99
    });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("price", 14.99);
  });

  it("Devrait supprimer un produit", async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Produit supprimé");
  });
});
