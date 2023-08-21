import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.action";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
// impot {currentUse/r}

const page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative ">
      <div>
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={user?.id || ""}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>
      <div className="mt-7">
        <Comment 
        threadId={thread._id}
        currentUserImg = {userInfo.image}
        currentUserId ={JSON.stringify (userInfo._id)}
        />
      </div>
      <div className="mt-10">
        {thread.children.map((childIItem:any) => (
             <ThreadCard
             key={childIItem._id}
             id={childIItem._id}
             currentUserId={user?.id || ""}
             parentId={childIItem.parentId}
             content={childIItem.text}
             author={childIItem.author}
             community={childIItem.community}
             createdAt={childIItem.createdAt}
             comments={childIItem.children}
             isComment 
           />
        ))}
      </div>
    </section>
  );
};

export default page;