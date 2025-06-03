import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const postSchema = z.object({
    title: z.string().min(5, { message: "Debe tener 5 caracteres" }),
    body: z.string().min(20, { message: "Debe tener 20 caracteres" }),
})


export const RHForm = () => {

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(postSchema) })
    const [posts, setPosts] = useState([]);

    // Estados para gestión de errores
    // esto nos permite ver que el componente se renderiza con cada onChange
    console.log('El componente se ha renderizado');


    const onSubmit = (data) => {
        //console.log(data);

        const newPost = {
            id: Date.now(), //timestamp
            title: data.title,
            body: data.body,
            published: false,
        };

        setPosts([...posts, newPost]);
        reset()
        toast.success(`Post ${newPost.id} creado`)
    };

    const togglePublished = (id) => {
        setPosts(posts.map(post =>
            post.id === id ? { ...post, published: !post.published } : post
        ));
    };

    const handleDelete = (id) => {
        setPosts(posts.filter(post => post.id !== id));
        toast.error(`Post ${id} eliminado`)
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Formulario de creación de posts */}
            <Card className="max-h-120">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Gestión de Posts</CardTitle>
                        <CardDescription>
                            Formulario controlado con validación.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Título
                            </label>
                            <Input
                                {...register("title")}
                                type="text"
                                id="title"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Insertar título del post"
                            />
                            {/* Mostrar mensaje de error si existe */}
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title?.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                Contenido
                            </label>
                            <Textarea
                                {...register("body")}
                                id="body"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Insertar contenido del post"
                            />
                            {/* Mostrar mensaje de error si existe */}
                            {errors.body && (
                                <p className="text-red-500 text-sm mt-1">{errors.body?.message}</p>
                            )}
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                Crear Post
                            </Button>
                        </div>
                    </form>
                    <DevTool control={control} />
                </CardContent>
            </Card>

            {/* Listado de posts */}
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Listado de Posts</CardTitle>
                        <CardDescription>
                            Publica o elimina los posts creados.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <p className="text-gray-600">No hay posts creados aún.</p>
                    ) : (
                        <ul className="space-y-4">
                            {posts.map(post => (
                                <li key={post.id} className="border p-4 rounded-md relative">
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="absolute top-3 right-3 text-red-500"
                                    >
                                        <Trash2 />
                                    </button>
                                    <h3 className="text-lg font-semibold">{post.title}</h3>
                                    <p className="text-gray-600 mt-2 break-words">{post.body}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className={`text-sm ${post.published ? 'text-green-600' : 'text-red-600'}`}>
                                            {post.published ? 'Publicado' : 'No publicado'}
                                        </span>
                                        <div className="flex items-center">
                                            <Switch
                                                id={`published-${post.id}`}
                                                checked={post.published}
                                                onCheckedChange={() => togglePublished(post.id)}
                                            />
                                            <label htmlFor={`published-${post.id}`} className="ml-2 text-sm text-gray-700">
                                                {post.published ? 'Despublicar' : 'Publicar'}
                                            </label>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}