<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Like;
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
            return response()->json(['message'=>'Like deleted successfully']);
        }else{
            $like = Like::create([
                'user_id'=>Auth::id(),
                'post_id'=>$request->post_id,
            ]);
            return response()->json(['message'=>'Like created successfully']);
        }
    }
}
