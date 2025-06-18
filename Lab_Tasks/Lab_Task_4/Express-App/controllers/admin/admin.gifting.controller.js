let express = require("express");
let controller = express.Router();
let Gifting = require("../../models/gifting.model");

controller.get("/admin/create_gifting", async (req, res) => {
    try {
        const giftingProducts = await Gifting.find();
        return res.render("admin/create_gifting", { 
            layout: "admin/adminlayout",
            giftingProducts: giftingProducts 
        });
    } catch (error) {
        console.error("Error fetching gifting products:", error);
        return res.render("admin/create_gifting", { 
            layout: "admin/adminlayout",
            giftingProducts: [],
            error: "Failed to fetch gifting products"
        });
    }
});

controller.post("/admin/create_gifting", async (req, res) => {
    let data = req.body;

    let p = new Gifting();
    p.title = data.title;
    p.description = data.description;
    p.name = data.name;
    p.imageUrl = data.imageUrl;
    p.altText = data.altText;
    p.linkUrl = data.linkUrl;

    await p.save();
    return res.redirect("/");
});

module.exports = controller;