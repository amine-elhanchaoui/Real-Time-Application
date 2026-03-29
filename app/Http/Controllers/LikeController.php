<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Like;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
class LikeController extends Controller
{
    public function toggle(Request $request){
        $request->validate([
            'post_id'=>'required|exists:posts,id',
        ]);
        $like = Like::where('post_id', $request->post_id)->where('user_id', Auth::id())->first();
        if($like){
            $like->delete();
            broadcast(new \App\Events\GotNewLike($request->post_id))->toOthers();
            return response()->json(['message'=>'Like deleted successfully']);
        }else{
            $like = Like::create([
                'user_id'=>Auth::id(),
                'post_id'=>$request->post_id,
            ]);

            broadcast(new \App\Events\GotNewLike($request->post_id))->toOthers();

            $post = Post::find($request->post_id);
            if ($post && $post->user_id !== Auth::id()) {
                $notification = Notification::create([
                    'from_user_id' => Auth::id(),
                    'to_user_id' => $post->user_id,
                    'type' => 'like',
                    'data' => [
                        'post_id' => $post->id,
                        'message' => Auth::user()->name . ' liked your post.',
                    ],
                ]);
                $notification->load('sender.profile');
                broadcast(new \App\Events\GotNewNotification($post->user_id, $notification));
            }
            return response()->json(['message'=>'Like created successfully']);
        }
    }
}
