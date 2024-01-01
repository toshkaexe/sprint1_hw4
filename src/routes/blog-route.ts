import {Router, Request, Response} from 'express';
import {BlogRepository} from "../repositories/blog-repository";
import {authMiddleware} from "../middlewares_validation/auth-middlewares";
import {blogValidation, nameValidation} from "../validators/blog-validation";
import {randomUUID} from "crypto";
import {db} from '../db/db'
import {StatusCode
} from "../models/common";
import {CreateBlogModel, OutputBlogModel, Paginator} from "../models/blogs/blog-models";
import {ObjectId} from "mongodb";
import {BlogService} from "../domain/blog-service";
import {getPageOptions} from "../types/type";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";
import {postValidation} from "../validators/post-validation";
import {PostsService} from "../domain/posts-service";


export const blogRoute = Router({})

blogRoute.get('/',
    async (req: Request, res: Response): Promise<void> => {
        const { pageNumber, pageSize, sortBy, sortDirection } = getPageOptions(req.query);
        const searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null

        const foundBlogs: Paginator<OutputBlogModel> = await
            BlogsQueryRepository.findBlogs(pageNumber, pageSize,
            sortBy, sortDirection, searchNameTerm)
        res.send(foundBlogs)
    })


blogRoute.post('/',
    authMiddleware,
    blogValidation(),
    async (req: Request, res: Response): Promise<void> => {
        const newBlog = await BlogService.createBlog(req.body)
        res.status(StatusCode.CREATED_201).send(newBlog)
    })

blogRoute.get('/:blogId',
    async (req: Request, res: Response): Promise<void> => {
        const foundBlog: OutputBlogModel | null = await BlogsQueryRepository.findBlogById(req.params.blogId)
        foundBlog ? res.status(StatusCode.OK_200).send(foundBlog) : res.sendStatus(StatusCode.NOT_FOUND_404)

    })

blogRoute.get('/:blogId/posts',
    async (req: Request, res: Response): Promise<void> => {
        const foundBlog: OutputBlogModel | null =
            await BlogsQueryRepository.findBlogById(req.params.blogId)
        if (!foundBlog) {
            res.sendStatus(404)
            return
        }
        const { pageNumber, pageSize, sortBy, sortDirection } = getPageOptions(req.query);

        const posts = await BlogsQueryRepository.getPostsToBlog(req.params.blogId, pageNumber, pageSize, sortBy, sortDirection)
        if (!posts) {
            res.sendStatus(404)
            return
        }
        res.status(200).send(posts)
    })


blogRoute.post('/:blogId/posts',
    authMiddleware,
    blogValidation(),
    async (req: Request, res: Response) => {
        const newPost = await PostsService.createPost({blogId: req.params.blogId, ...req.body})
        if (!newPost) {
            return res.sendStatus(StatusCode.NOT_FOUND_404)
        }
        return res.status(StatusCode.CREATED_201).send(newPost)
    }
)

blogRoute.put('/:blogId',
    authMiddleware,
    blogValidation(),
    async (req: Request, res: Response): Promise<void> => {
        const blogId = req.params.blogId
        const isUpdated = await BlogService.updateBlog(blogId, req.body)
        isUpdated ? res.status(StatusCode.NoContent_204)
                .send(BlogsQueryRepository.findBlogById(blogId)) :
            res.sendStatus(StatusCode.NOT_FOUND_404)
    })

blogRoute.delete('/:blogId',
    authMiddleware,
    async (req: Request, res: Response) => {
        const isDeleted = await BlogService.deleteBlog(req.params.blogId)
        isDeleted ? res.sendStatus(StatusCode.NoContent_204) :
            res.sendStatus(StatusCode.NOT_FOUND_404)
    })