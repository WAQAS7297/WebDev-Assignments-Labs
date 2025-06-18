let express = require("express");
let controller = express.Router();
let Carosel = require("../../models/Carosel.model");

controller.get("/admin/create_carosel", async (req, res) => {
    try {
        const carouselItems = await Carosel.find().sort({ displayOrder: 1 });
        return res.render("admin/create_carosel", { 
            layout: "admin/adminlayout",
            carouselItems: carouselItems 
        });
    } catch (error) {
        console.error("Error fetching carousel items:", error);
        return res.render("admin/create_carosel", { 
            layout: "admin/adminlayout",
            carouselItems: [],
            error: "Failed to fetch carousel items"
        });
    }
});

controller.post("/admin/create_carosel", async (req, res) => {
    let data = req.body;

    let p = new Carosel();
    p.heading = data.heading;
    p.description = data.description;
    p.imageUrl = data.imageUrl;
    p.altText = data.altText;
    p.productLink = data.productLink;
    p.isActive = data.isActive;
    p.displayOrder = data.displayOrder;

    await p.save();
    return res.redirect("/");
});

module.exports = controller;