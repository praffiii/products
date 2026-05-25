const express = require('express');
const pool = require('../db');

const router = express.Router();

function isValidProductInput(name, price) {
  return typeof name === 'string' && name.trim() !== '' && Number.isInteger(price) && price >= 0;
}

function parseProductId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function findProductById(id) {
  const [products] = await pool.query(
    'SELECT id, name, price FROM products WHERE id = ?',
    [id]
  );

  return products[0] || null;
}

router.post('/', async (req, res) => {
  const { name, price } = req.body;

  if (!isValidProductInput(name, price)) {
    return res.status(400).json({
      message: 'Product name must be a non-empty string and price must be a non-negative integer'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name.trim(), price]
    );

    return res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: result.insertId,
        name: name.trim(),
        price
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);

    return res.status(500).json({
      message: 'Failed to create product'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT id, name, price FROM products ORDER BY id ASC');

    return res.json({
      products
    });
  } catch (error) {
    console.error('Error getting products:', error);

    return res.status(500).json({
      message: 'Failed to get products'
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseProductId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer'
    });
  }

  try {
    const product = await findProductById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json({
      product
    });
  } catch (error) {
    console.error('Error getting product:', error);

    return res.status(500).json({
      message: 'Failed to get product'
    });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  const { name, price } = req.body;

  if (!id) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer'
    });
  }

  if (!isValidProductInput(name, price)) {
    return res.status(400).json({
      message: 'Product name must be a non-empty string and price must be a non-negative integer'
    });
  }

  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ? WHERE id = ?',
      [name.trim(), price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json({
      message: 'Product updated successfully',
      product: {
        id,
        name: name.trim(),
        price
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);

    return res.status(500).json({
      message: 'Failed to update product'
    });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseProductId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer'
    });
  }

  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);

    return res.status(500).json({
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;
