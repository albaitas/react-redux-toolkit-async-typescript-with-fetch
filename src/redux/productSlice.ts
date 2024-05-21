import { createSlice, createAsyncThunk, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { Product, ProductsResponse, ProductsState } from '../../types';

const initialState: ProductsState = {
  products: { products: [] },
  loading: false,
  error: null
};

export const getProducts = createAsyncThunk<Product[], void, { rejectValue: string }>('products/getProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('https://dummyjson.com/products');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ProductsResponse = await response.json();
    return data.products;
  } catch (error) {
    return rejectWithValue('Server Error!');
  }
});

export const addProduct = createAsyncThunk<Product, string, { rejectValue: string }>('products/addProduct', async (text, { rejectWithValue }) => {
  try {
    const response = await fetch('https://dummyjson.com/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 101,
        title: text,
        description: 'This is one of the best and amazing t-shirt in the market',
        price: 99,
        thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg'
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: Product = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue("Can't add task. Server error.");
  }
});

export const deleteProduct = createAsyncThunk<number, number, { rejectValue: string }>('products/deleteProduct', async (productId, { rejectWithValue }) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return productId;
  } catch (error) {
    return rejectWithValue("Can't delete product. Server error.");
  }
});

export const updateProduct = createAsyncThunk<Product, Product, { rejectValue: string }>('products/updateProduct', async (product, { rejectWithValue }) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${product.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: product.title })
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data: Product = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue("Can't update product. Server error.");
  }
});

function isError(action: UnknownAction) {
  return action.type.endsWith('rejected');
}

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products.products = action.payload;
      })
      .addCase(addProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.products.push(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products.products = state.products.products.filter((product) => product.id !== action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.products.findIndex((product) => product.id === action.payload.id);
        if (index !== -1) {
          state.products.products[index] = action.payload;
        }
      })

      .addMatcher(isError, (state, action: PayloadAction<string>) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export default productSlice.reducer;
