let express = require("express");
let controller = express.Router();
let Category = require("../../models/categories.model");

controller.get("/admin/create_category", async (req, res) => {
    try {
        const existingCategories = await Category.find().sort({ name: 1 });

        return res.render("admin/create_category", {
            layout: "admin/adminlayout",
            categories: existingCategories, 
            pageTitle: "Create Category", 
            formData: {},
            error: null 
        });
    } catch (error) {
        console.error("Error preparing create category page:", error);
        return res.render("admin/create_category", {
            layout: "admin/adminlayout",
            categories: [], 
            error: "Failed to load the create category page. " + error.message,
            formData: {},
            pageTitle: "Create Category"
        });
    }
});

controller.post("/admin/create_category", async (req, res) => {
    let data = req.body;
    try {
        if (!data.category || !data.imageUrl || !data.PageUrl) {
            const existingCategories = await Category.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/create_category", {
                layout: "admin/adminlayout",
                categories: existingCategories,
                error: "Category name, Image URL, and Page URL are required.",
                formData: data, 
                pageTitle: "Create Category"
            });
        }

        const existingCategory = await Category.findOne({ name: data.category });
        if (existingCategory) {
            const existingCategories = await Category.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/create_category", {
                layout: "admin/adminlayout",
                categories: existingCategories,
                error: `A category with the name "${data.category}" already exists.`,
                formData: data,
                pageTitle: "Create Category"
            });
        }

        let newCategory = new Category({
            name: data.category,
            image: data.imageUrl,
            pagelink: data.PageUrl,
            alt_text: data.alt_text,
            title: data.title
        });

        await newCategory.save();

        return res.redirect("/admin"); 

    } catch (error) {
        console.error("Error creating category:", error);
        let existingCategoriesForError = [];
        try {
            existingCategoriesForError = await Category.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing categories during error handling:", fetchErr);
        }

        return res.render("admin/create_category", {
            layout: "admin/adminlayout",
            categories: existingCategoriesForError,
            error: "Failed to create category. Please try again. " + error.message,
            formData: data, 
            pageTitle: "Create Category"
        });
    }
});

module.exports = controller;