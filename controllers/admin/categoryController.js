const Category = require('../../models/categoryModel');

exports.getCategories = async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = 5;

    const skip = (page - 1) * limit;

    const search = req.query.search || '';

    const searchQuery = {

      is_deleted: false,

      category_name: {
        $regex: search,
        $options: 'i'
      }

    };

    const categories = await Category.find(searchQuery)

      .sort({ created_at: -1 }) // DESCENDING ORDER

      .skip(skip)

      .limit(limit);

    const totalCategories = await Category.countDocuments(searchQuery);

    const activeCategories = await Category.countDocuments({
      ...searchQuery,
      is_active: true
    });

    const unlistedCategories = await Category.countDocuments({
      ...searchQuery,
      is_active: false
    });

    const totalPages = Math.ceil(totalCategories / limit);

    res.render('admin/categories', {

      categories,

      totalCategories,

      activeCategories,

      unlistedCategories,

      currentPage: page,

      totalPages,

      search

    });

  } catch (error) {

    console.log(error);

  }

};

exports.addCategory = async (req, res) => {

  try {

const category_name = req.body.category_name.trim();

const description = req.body.description;
    const existingCategory = await Category.findOne({

      category_name: {
        $regex: '^' + category_name.trim() + '$',
        $options: 'i'
      },

      is_deleted: false

    });

    if (existingCategory) {

      req.session.message = {
        type: 'error',
        text: 'Category already exists'
      };

      return res.redirect('/admin/categories');

    }

    const category = new Category({

      category_name: category_name.trim(),

      description,

      image: req.file
        ? '/uploads/categories/' + req.file.filename
        : '',

      is_active: req.body.is_active === 'on'

    });

    await category.save();

    req.session.message = {
      type: 'success',
      text: 'Category added successfully'
    };

    res.redirect('/admin/categories');

 } catch (error) {

  console.log(error);

  if (error.code === 11000) {

    req.session.message = {
      type: 'error',
      text: 'Category already exists'
    };

    return res.redirect('/admin/categories');
  }

  req.session.message = {
    type: 'error',
    text: 'Failed to add category'
  };

  res.redirect('/admin/categories');

 }
}


exports.editCategory = async (req, res) => {

  try {

    const id = req.params.id;

    const {
      category_name,
      description,
      is_active
    } = req.body;

    const existingCategory = await Category.findOne({

      category_name: {
        $regex: '^' + category_name.trim() + '$',
        $options: 'i'
      },

      _id: { $ne: id },

      is_deleted: false

    });

    if (existingCategory) {

      req.session.message = {
        type: 'error',
        text: 'Category name already exists'
      };

      return res.redirect('/admin/categories');

    }

    const updateData = {

      category_name: category_name.trim(),

      description,

      is_active: is_active === 'on'

    };

    if (req.file) {

      updateData.image =
        '/uploads/categories/' + req.file.filename;

    }

    await Category.findByIdAndUpdate(id, updateData);

    req.session.message = {
      type: 'success',
      text: 'Category updated successfully'
    };

    res.redirect('/admin/categories');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to update category'
    };

    res.redirect('/admin/categories');

  }

};

exports.toggleCategoryStatus = async (req, res) => {

  try {

    const id = req.params.id;

    const category = await Category.findById(id);

    if (!category) {

      req.session.message = {
        type: 'error',
        text: 'Category not found'
      };

      return res.redirect('/admin/categories');

    }

    category.is_active = !category.is_active;

    await category.save();

    req.session.message = {
      type: 'success',
      text: `Category ${
        category.is_active
          ? 'listed'
          : 'unlisted'
      } successfully`
    };

    res.redirect('/admin/categories');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to update category status'
    };

    res.redirect('/admin/categories');

  }

};
exports.deleteCategory = async (req, res) => {

  try {

    const id = req.params.id;

    await Category.findByIdAndUpdate(id, {
      is_deleted: true
    });

    req.session.message = {
      type: 'success',
      text: 'Category deleted successfully'
    };

    res.redirect('/admin/categories');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to delete category'
    };

    res.redirect('/admin/categories');

  }

};