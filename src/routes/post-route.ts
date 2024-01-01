import {Router, Request, Response} from 'express';
import {BlogRepository} from "../repositories/blog-repository";
import {authMiddleware} from "../middlewares_validation/auth-middlewares";
import {blogValidation, nameValidation} from "../validators/blog-validation";
import {PostsRepository} from "../repositories/posts-repository";

import {
    BlogBody,
    Params,
    PostBody,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, StatusCode
} from "../models/common";
import {randomUUID} from "crypto";
import {blogRoute} from "./blog-route";
import {CreatePostModel, OutputPostModel} from "../models/posts/posts-models";
import {postValidation} from "../validators/post-validation";
import {db} from "../db/db";
import {getPageOptions} from "../types/type";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {PostsService} from "../domain/posts-service";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";
import {OutputBlogModel} from "../models/blogs/blog-models";

export const postRoute = Router({})

//get
postRoute.get('/', async (req: Request, res: Response) => {
    const { pageNumber, pageSize, sortBy, sortDirection } = getPageOptions(req.query);

    const foundPosts =
        await PostsQueryRepository.findPosts(pageNumber, pageSize, sortBy, sortDirection)
    res.send(foundPosts)
})

postRoute.post('/',
    authMiddleware,
    postValidation(),
    async (req: Request, res: Response) => {
        const newPostId = await PostsService.createPost(req.body)
        if (!newPostId) return res.sendStatus(404);

        const newPost = await PostsQueryRepository.findPostById(newPostId)
        newPost ? res.status(StatusCode.CREATED_201).send(newPost) :
            res.sendStatus(StatusCode.NOT_FOUND_404)
        return
    })

postRoute.get('/:postId', async (req: Request, res: Response) => {
    const foundPost: OutputPostModel | null =
        await PostsQueryRepository.findPostById(req.params.postId)
    foundPost ? res.status(StatusCode.OK_200).send(foundPost) : res.sendStatus(StatusCode.NOT_FOUND_404)
})
//put
postRoute.put('/:postId',
    authMiddleware,
    postValidation(),
    //inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const blogId = req.body.blogId
        const postId = req.params.postId
        const blogExist: OutputBlogModel | null = await BlogsQueryRepository.findBlogById(blogId)
        const postExist = await PostsQueryRepository.findPostById(postId)

        if (!blogExist) {
            res.status(StatusCode.NOT_FOUND_404).send("error blog")
            return
        }
        if (!postExist) {
            res.status(StatusCode.NOT_FOUND_404).send("error post")
            return
        }
        await PostsService.updatePost(postId, req.body)
        res.status(StatusCode.NoContent_204).send('No content')
    })

//+
postRoute.delete('/:postId',
    authMiddleware,
    async (req: Request, res: Response) => {
        const isDeleted = await PostsService.deletePost(req.params.postId)
        isDeleted ? res.sendStatus(StatusCode.NoContent_204) : res.sendStatus(StatusCode.NOT_FOUND_404)
    })