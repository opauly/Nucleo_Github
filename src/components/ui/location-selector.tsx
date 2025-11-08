"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LocationSelectorProps {
	selectedProvincia: string
	selectedCanton: string
	selectedDistrito: string
	onProvinciaChange: (provincia: string) => void
	onCantonChange: (canton: string) => void
	onDistritoChange: (distrito: string) => void
	disabled?: boolean
}

interface Provincia {
	id: number
	nombre: string
}

interface Canton {
	id: number
	nombre: string
	provincia_id: number
}

interface Distrito {
	id: number
	nombre: string
	canton_id: number
}

export function LocationSelector({
	selectedProvincia,
	selectedCanton,
	selectedDistrito,
	onProvinciaChange,
	onCantonChange,
	onDistritoChange,
	disabled = false
}: LocationSelectorProps) {
	const [provincias, setProvincias] = useState<Provincia[]>([])
	const [cantones, setCantones] = useState<Canton[]>([])
	const [distritos, setDistritos] = useState<Distrito[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>('')

	const supabase = createClient()

	// Load provincias on component mount
	useEffect(() => {
		loadProvincias()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Load cantones when provincia changes
	useEffect(() => {
		if (selectedProvincia) {
			loadCantones(selectedProvincia)
			// Reset canton and distrito when provincia changes
			onCantonChange('')
			onDistritoChange('')
		} else {
			setCantones([])
			setDistritos([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProvincia])

	// Load distritos when canton changes
	useEffect(() => {
		if (selectedCanton) {
			loadDistritos(selectedCanton)
			// Reset distrito when canton changes
			onDistritoChange('')
		} else {
			setDistritos([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCanton])

	const loadProvincias = async () => {
		try {
			setLoading(true)
			setError('')
			console.log('LocationSelector: fetching provincias...')

			const response = await fetch('/api/locations?type=provincias')
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Error fetching provincias')
			}

			console.log('LocationSelector: provincias count =', result.data?.length)
			setProvincias(result.data || [])
		} catch (err: any) {
			console.error('Error loading provincias:', err)
			setError('Error cargando provincias')
		} finally {
			setLoading(false)
		}
	}

	const loadCantones = async (provincia: string) => {
		try {
			setError('')

			// First get the provincia_id
			const provinciaResponse = await fetch('/api/locations?type=provincias')
			const provinciaResult = await provinciaResponse.json()

			if (!provinciaResponse.ok) {
				throw new Error(provinciaResult.error || 'Error fetching provincias')
			}

			const provinciaData = provinciaResult.data.find((p: any) => p.nombre === provincia)
			if (!provinciaData) {
				throw new Error('Provincia no encontrada')
			}

			// Then get cantones for that provincia_id
			const response = await fetch(`/api/locations?type=cantones&parentId=${provinciaData.id}`)
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Error fetching cantones')
			}

			console.log('LocationSelector: cantones count =', result.data?.length, 'for provincia', provincia)
			setCantones(result.data || [])
		} catch (err: any) {
			console.error('Error loading cantones:', err)
			setError('Error cargando cantones')
		}
	}

	const loadDistritos = async (canton: string) => {
		try {
			setError('')

			// First get the canton_id by fetching all cantones and finding the match
			const cantonResponse = await fetch('/api/locations?type=cantones-by-name')
			const cantonResult = await cantonResponse.json()

			if (!cantonResponse.ok) {
				throw new Error(cantonResult.error || 'Error fetching cantones')
			}

			// Find the canton by name (this is a bit inefficient, but works for now)
			const cantonData = cantonResult.data.find((c: any) => c.nombre === canton)
			if (!cantonData) {
				throw new Error('Cantón no encontrado')
			}

			// Then get distritos for that canton_id
			const response = await fetch(`/api/locations?type=distritos&parentId=${cantonData.id}`)
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Error fetching distritos')
			}

			console.log('LocationSelector: distritos count =', result.data?.length, 'for canton', canton)
			setDistritos(result.data || [])
		} catch (err: any) {
			console.error('Error loading distritos:', err)
			setError('Error cargando distritos')
		}
	}

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
					<div className="h-10 bg-slate-200 rounded"></div>
				</div>
				<div className="animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
					<div className="h-10 bg-slate-200 rounded"></div>
				</div>
				<div className="animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
					<div className="h-10 bg-slate-200 rounded"></div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{error && (
				<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
					{error}
				</div>
			)}

			{/* Provincia */}
			<div>
				<label htmlFor="provincia" className="block text-sm font-medium text-slate-700 mb-2">
					Provincia *
				</label>
				<select
					id="provincia"
					value={selectedProvincia}
					onChange={(e) => onProvinciaChange(e.target.value)}
					disabled={disabled}
					className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
					required
				>
					<option value="">Seleccionar</option>
					{provincias.map((provincia) => (
						<option key={provincia.id} value={provincia.nombre}>
							{provincia.nombre}
						</option>
					))}
				</select>
				{!error && provincias.length === 0 && (
					<p className="mt-2 text-xs text-slate-500">No hay provincias disponibles. Verifica conexión y RLS/políticas en Supabase.</p>
				)}
			</div>

			{/* Cantón */}
			<div>
				<label htmlFor="canton" className="block text-sm font-medium text-slate-700 mb-2">
					Cantón *
				</label>
				<select
					id="canton"
					value={selectedCanton}
					onChange={(e) => onCantonChange(e.target.value)}
					disabled={disabled || !selectedProvincia}
					className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
					required
				>
					<option value="">Seleccionar</option>
					{cantones.map((canton) => (
						<option key={canton.id} value={canton.nombre}>
							{canton.nombre}
						</option>
					))}
				</select>
			</div>

			{/* Distrito */}
			<div>
				<label htmlFor="distrito" className="block text-sm font-medium text-slate-700 mb-2">
					Distrito *
				</label>
				<select
					id="distrito"
					value={selectedDistrito}
					onChange={(e) => onDistritoChange(e.target.value)}
					disabled={disabled || !selectedCanton}
					className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
					required
				>
					<option value="">Seleccionar</option>
					{distritos.map((distrito) => (
						<option key={distrito.id} value={distrito.nombre}>
							{distrito.nombre}
						</option>
					))}
				</select>
				{selectedCanton && distritos.length === 0 && (
					<p className="mt-2 text-xs text-slate-500">
						No hay distritos disponibles para este cantón.
					</p>
				)}
			</div>
		</div>
	)
}
