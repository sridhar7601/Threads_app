"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import Thread from "../models/thread.modal";
import { FilterQuery, SortOrder } from "mongoose";
// import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
// import path from "path";

   interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}





export async function updateUser({
    userId,
    username,
    name,
    image,
    path,
    bio,
}:Params
): Promise<void> {
    connectToDatabase();
    
    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                image,
                bio,
                onboarded: true,
            },
            {
                upsert: true,
            }
        );
        
        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failure to create or update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string){

    try {
        connectToDatabase();
        return await User.findOne({ id: userId })
        // .populate({
        //     path:'communities',
        //     model:'Community',
        // })
    } catch (error:any) {
        throw new Error(`Failure to fetch user: ${error.message}`);
        
    }
}

export async function fetchUserPosts(userId:string){

    try {
        connectToDatabase();

        //find all threads of the authorized user with given user id

        //todo: community population 

        const threads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: {
                path: "children",
                model: Thread,
                populate: {
                    path: "author",
                    model: User,
                    select:'name image id'
                }
            }
        })

return threads;
    } catch (error:any) {
        throw new Error(`Failure to fetch user posts: ${error.message}`);
        
    }
}

export async function fetchUsers({
userId,
searchString = "",
pageNumber = 1,
pageSize = 20,
sortBy = "desc"
}:{
    userId:string;
    searchString?:string;
    pageNumber?:number;
    pageSize?:number;
    sortBy?:SortOrder;
}){
    try {
        connectToDatabase();
        const skipAmount = (pageNumber - 1) *  pageSize;

        const regex = new RegExp(searchString, "i");
        const query:FilterQuery<typeof User> = {
            id:{$ne:userId}
        }

        if (searchString.trim() !== '') {
            query.$or = [
              { username:{ $regex: regex }},
                { name: { $regex: regex }},
            ];
        }

        const sortOptions = {
            createdAt: sortBy};

            const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

            const totalUsersCount = await User.countDocuments(query);
            const users = await usersQuery.exec();

            const isNext = totalUsersCount  >  skipAmount + users.length;

            return {users, isNext};
        

        } catch (error:any) {
        throw new Error(`Failure to fetch users: ${error.message}`);
        
    }
}
export async function getActivity(userId:string){
    try {
        connectToDatabase();
        //find all threads created by user
        const userThreads = await Thread.find({author:userId})
        const childThreadIds = userThreads.reduce((acc, userThread) =>{
        return acc.concat(userThread.children)},[]);

        const replies = await Thread.find({
            _id:{$in:childThreadIds},
            author:{$ne:userId},
        }).populate({
            path:'author',
            model:'User',
            select:'name image _id'
        })

return replies;
    } catch (error:any) {
        throw new Error(`Failure to fetch activity: ${error.message}`);
    }



}