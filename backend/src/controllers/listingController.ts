import { Request, Response } from 'express';
import Listing from '../models/listings';
import { deleteReviewsByListing } from './reviews.controllers';

// Get all listings
export const getAllListings = async (req: Request, res: Response) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get listing by l_id instead of MongoDB _id
export const getListingById = async (req: Request, res: Response) => {
  try {
    const l_id = parseInt(req.params.id, 10); // Parse l_id as a number
    const listing = await Listing.findOne({ l_id });
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const createListing = async (req: Request, res: Response) => {
  try {
    const imageUrls = (req.files as Express.Multer.File[])?.map((file) => file.filename) || [];
    
    const lastListing = await Listing.findOne().sort({ l_id: -1 });
    const newLID = lastListing ? lastListing.l_id + 1 : 1;

    const newListing = new Listing({ 
      ...req.body, 
      l_id: newLID,
      imageUrls, 
      amenities: req.body.amenities.split(',').map((item: string) => item.trim()) 
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a listing by l_id
export const updateListing = async (req: Request, res: Response) => {
  try {
    const l_id = parseInt(req.params.id, 10);
    const listing = await Listing.findOne({ l_id });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Update fields
    listing.title = req.body.title || listing.title;
    listing.location = req.body.location || listing.location;
    listing.price = req.body.price || listing.price;
    listing.rating = req.body.rating || listing.rating;
    listing.description = req.body.description || listing.description;
    listing.amenities = req.body.amenities ? req.body.amenities.split(',').map((item: string) => item.trim()) : listing.amenities;

    // Update image URLs if new images are uploaded
    const newImageUrls = (req.files as Express.Multer.File[])?.map((file) => file.filename) || [];
    listing.imageUrls = [...listing.imageUrls, ...newImageUrls];

    const updatedListing = await listing.save();
    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a listing by l_id
export const deleteListing = async (req: Request, res: Response) => {
  try {
    const l_id = parseInt(req.params.id, 10);
    const listing = await Listing.findOneAndDelete({ l_id });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Delete associated reviews
    await deleteReviewsByListing(l_id);

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};