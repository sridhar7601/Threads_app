"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Thread from "../models/thread.modal";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDatabase();
    console.log("iiii");

    // Create thread

    const createdThread = await Thread.create({
      text,
      author,
      commuinity: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // Revalidate community
    revalidatePath(path);
  } catch (error: any) {
    console.log(`Error in threads.action.ts ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDatabase();

  //calculate the number of posts to skip
  const skipAmount = pageSize * (pageNumber - 1);

  //fetch posts that have no parent (top level posts ot threads....)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({ path: 'children', populate: { path: 'author', model: User,select: "_id name parentId image" } 
   });

   const totalPostCount = await Thread.countDocuments({parentId: { $in: [null, undefined] } });

   const posts = await postsQuery.exec();

   const isNext= totalPostCount > skipAmount + posts.length;

   return {posts, isNext};
}

export async function fetchThreadById(id: string) {
connectToDatabase();

try {
  //Todo for later communityId
  const thread = await Thread.findById(id)
  .populate({ path: 'author', model: User, select: "_id id name image" })
  .populate({
    path: 'children',
    populate: [{path:'author', model: User, select: "_id id name parentId image"},
     {path: 'children', model:Thread,
     populate: {path: 'author', model: User, select: "_id id name parentId image"} }]
  }).exec();
  return  thread;
  
}
  catch (error: any) {
throw new Error(`Error in threads.action in fetch comment ${error.message}`);
}
}

export async function addCommentToThread(threadId: string,commentText:string, userId:string,path:string)
{
connectToDatabase();
try {
  //find orginal thread by id

  const originalThread = await Thread.findById(threadId);
  if(!originalThread) throw new Error("Thread not found");

  //create new comment
  const commentThread = new Thread({
    text: commentText,
    author : userId,
    parentId: threadId,
   })
   
   //save new thread to db
   const savedCommentThread = await commentThread.save();

   //update original thread to include new comment
    originalThread.children.push(savedCommentThread._id);

    //save original thread
    await originalThread.save();

    revalidatePath(path);

} catch (error: any) {
  throw new Error(`Error in threads.action in addCommentToThread ${error.message}`);
  
}
}