import React from 'react'

import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadTab from "@/components/shared/ThreadsTab";
import { profileTabs } from "@/constants";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import Thread from "@/lib/models/thread.modal";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";
import UserCard from '@/components/cards/UserCard';

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) {
    redirect("/onboarding"); 
  }
    //fetch user info
    const result = await fetchUsers({
        userId: user.id,
        searchString:'',
        pageNumber: 1,
        pageSize: 10,
    });
    
  
    return (
   <section>
<h1 className='head-text mb-10'>Search</h1>
<div className='mt-1 flex flex-col gap-9'>
    {result.users.length === 0? (
        <p className='no-result'> No Users</p>
    ):(
        <>
        {result.users.map((person) => (
            <UserCard 
            key={person.id}
            id={person.id}
            name = {person.name}
            username = {person.username}
            imgUrl = {person.image}
            personType = 'User'
            />

        ))}
        </>
    )}
</div>
   </section>
  )

}
export default Page;
 