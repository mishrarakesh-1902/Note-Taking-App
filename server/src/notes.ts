import { Router } from 'express'
import { z } from 'zod'
import { db } from './db.js'
import { parse } from './errors.js'

export const notes = Router()
const fields = 'id,user_id,title,content,created_at,updated_at'
const noteInput = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().max(10000).default(''),
}).strict()

notes.post('/', async (req, res) => {
  const input = parse(noteInput, req.body)
  const { data: note, error } = await db.from('notes')
    .insert({ ...input, user_id: req.userId! })
    .select(fields).single()

  if (error) throw error
  res.status(201).json({ note })
})

notes.get('/', async (req, res) => {
  const { data, error } = await db.from('notes').select(fields)
    .eq('user_id', req.userId!).order('updated_at', { ascending: false })

  if (error) throw error
  res.json({ notes: data })
})
