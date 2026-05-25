const express = require('express');
const pool = require('../db');

const router = express.Router();

function isValidProductInput(name, price) {
  return typeof name === 'string' && name.trim() !== '' && Number.isInteger(price) && price >= 0;
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
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer'
    });
  }

  try {
    const [products] = await pool.query(
      'SELECT id, name, price FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json({
      product: products[0]
    });
  } catch (error) {
    console.error('Error getting product:', error);

    return res.status(500).json({
      message: 'Failed to get product'
    });
  }
});

module.exports = router;
