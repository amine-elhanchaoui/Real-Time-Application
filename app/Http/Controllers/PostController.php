<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $posts= Post::with(['user','comments.user',  'likes.user'])->get();
        return view('posts.index', compact('posts'));
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
            'content' => 'required|string|max:255',
            'title'=>'required|string|max:255',
        ]);
        $post = Post::create([
            'user_id'=>Auth::id(),
            'content'=>$request->content,
            'title'=>$request->title,
        ]);
        return response()->json($post);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $post = Post::with(['user','comments.user',  'likes.user'])->findOrFail($id);
        return response()->json($post);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
        $post = Post::findOrFail($id);
        return response()->json($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $post = Post::findOrFail($id);
        $post->update([
            'content'=>$request->content,
            'title'=>$request->title,
        ]);
        return response()->json($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $post = Post::findOrFail($id);
        if($post->user_id != Auth::id()){
            return response()->json(['error'=>'Unauthorized'],403);
        }
        $post->delete();
        return response()->json(['message'=>'Post deleted successfully']);  
    }
}
