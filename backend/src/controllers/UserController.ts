import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUp = async (req: Request, res: any) => {
  try {
    const { name, email, password } = req.body

    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    let result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword],
      )
    

    const token = jwt.sign(
      { id: result.rows[0].id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" },
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    })

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
      token,
    })
  } catch (error) {
    console.error("Error signing up user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}


export const signIn = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

      

        const token = jwt.sign(
            { id: user.id, },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
          );
      
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 3600000 
          });
      
          res.status(200).json({
            message: 'User signed in successfully',
            user: { id: user.id, name: user.name, email: user.email },
            token,
          });
        } catch (error) {
          console.error('Error signing in user:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt');
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getUserData = async (req: Request, res: any) => {
    try {
      const userId = req.user?.id;
      const token = req.cookies.jwt;

    
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({
        user: result.rows[0],
        token
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };