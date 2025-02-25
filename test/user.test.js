import chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("User API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it("Devrait créer un utilisateur", async () => {
    const res = await request(app).post("/api/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      role: "user",
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "John Doe");
  });

  it("Devrait récupérer tous les utilisateurs", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("Devrait récupérer un utilisateur par ID", async () => {
    const user = await User.create({ name: "Jane Doe", email: "jane@example.com", role: "admin" });

    const res = await request(app).get(`/api/users/${user._id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("email", "jane@example.com");
  });

  it("Devrait mettre à jour un utilisateur", async () => {
    const user = await User.create({ name: "Mike", email: "mike@example.com", role: "user" });

    const res = await request(app).put(`/api/users/${user._id}`).send({ name: "Mike Updated" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("name", "Mike Updated");
  });

  it("Devrait supprimer un utilisateur", async () => {
    const user = await User.create({ name: "Paul", email: "paul@example.com", role: "user" });

    const res = await request(app).delete(`/api/users/${user._id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Utilisateur supprimé");
  });

});
