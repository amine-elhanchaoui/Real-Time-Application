<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $request->validate([
            'post_id'=>'required|exists:posts,id',
            'content'=>'required|string|max:255',
        ]);
        $comment = Comment::create([
            'user_id'=>Auth::id(),
            'post_id'=>$request->post_id,
            'content'=>$request->content,
        ]);

        $comment->load('user.profile');
        broadcast(new \App\Events\GotNewComment($request->post_id, $comment))->toOthers();

        $post = Post::find($request->post_id);
        if ($post && $post->user_id !== Auth::id()) {
            $notification = Notification::create([
                'from_user_id' => Auth::id(),
                'to_user_id' => $post->user_id,
                'type' => 'comment',
                'data' => [
                    'post_id' => $post->id,
                    'message' => Auth::user()->name . ' commented on your post.',
                ],
            ]);
            $notification->load('sender.profile');
            broadcast(new \App\Events\GotNewNotification($post->user_id, $notification));
        }
        return response()->json($comment);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function getByPostId(string $id)
    {
        $comments = Comment::with('user')->where('post_id', $id)->get();
        return response()->json($comments);
    }
}
