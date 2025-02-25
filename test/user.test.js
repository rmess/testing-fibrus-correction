import chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("BDD - User API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  let userId;

  it("Devrait créer un utilisateur avec des données valides", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Alice Doe",
      email: "alice@example.com",
      role: "admin",
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Alice Doe");
    expect(res.body).to.have.property("email", "alice@example.com");
    userId = res.body._id;
  });

  it("Ne devrait pas créer un utilisateur sans email", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Bob Doe",
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("Devrait récupérer tous les utilisateurs même s’il y en a zéro", async () => {
    await User.deleteMany({}); // Supprime tous les utilisateurs
    const res = await request(app).get("/api/users");
    
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.equal(0);
  });

  it("Devrait renvoyer une erreur 404 si un utilisateur n'existe pas", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/${fakeId}`);

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Utilisateur non trouvé");
  });

  it("Devrait supprimer un utilisateur existant", async () => {
    const user = await User.create({ name: "Charlie Doe", email: "charlie@example.com", role: "user" });

    const res = await request(app).delete(`/api/users/${user._id}`);
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Utilisateur supprimé");
  });
});
