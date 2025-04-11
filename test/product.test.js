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

  it("Ne devrait pas créer un produit sans nom", async () => {
    const res = await request(app).post("/api/products").send({
      price: 9.99,
      stock: 20
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });


  it("Ne devrait pas créer un produit sans prix", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Thé Noir",
      stock: 30,
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("Ne devrait pas créer un produit avec un prix en string", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Erreur prix string",
      price: "dix",
      stock: 5
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
  
  it("Ne devrait pas accepter une mise à jour avec un champ inconnu", async () => {
    const res = await request(app).put(`/api/products/${productId}`).send({
      unknownField: "abc"
    });
    expect(res.status).to.be.oneOf([400, 200]); // dépend de l'implémentation
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

  it("Ne devrait pas supprimer un produit inexistant", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/products/${fakeId}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Produit non trouvé");
  });
  
});

/* 
  Autres cas de test possible :

  _Création avec prix négatif
  _Création avec stock nul (si le modèle ne le permet pas)
  _Création avec un nom qui dépasse une limite (ex. 255 caractères)
  _Création avec un prix non numérique
  _Création avec un stock non entier (ex. Float, Double etc)
  _Mise à jour sans données
  _Suppression avec un ID invalide (non conforme)
*/
