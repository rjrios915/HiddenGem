'use client'

import { useState, useRef } from 'react'
import { X, Upload, MapPin, Link } from 'lucide-react'
import type { ActivityCategory, BudgetRange } from '@/types'
import GemSvg from '@/components/ui/GemSvg'

const CATEGORIES: { value: ActivityCategory; label: string; emoji: string }[] = [
  { value: 'food',         label: 'Food',         emoji: '🍜' },
  { value: 'cafes',        label: 'Cafés',        emoji: '☕' },
  { value: 'outdoors',     label: 'Outdoors',     emoji: '🌿' },
  { value: 'art',          label: 'Art',          emoji: '🎨' },
  { value: 'music',        label: 'Music',        emoji: '🎵' },
  { value: 'wellness',     label: 'Wellness',     emoji: '🧘' },
  { value: 'nightlife',    label: 'Nightlife',    emoji: '🌙' },
  { value: 'workshops',    label: 'Workshops',    emoji: '🔧' },
  { value: 'fitness',      label: 'Fitness',      emoji: '💪' },
  { value: 'gaming',       label: 'Gaming',       emoji: '🎮' },
  { value: 'volunteering', label: 'Volunteering', emoji: '🤝' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function SubmitGemModal({ isOpen, onClose, onSuccess }: Props) {
  const [step,         setStep]         = useState<'details' | 'location' | 'media' | 'success'>('details')
  const [title,        setTitle]        = useState('')
  const [category,     setCategory]     = useState<ActivityCategory | ''>('')
  const [description,  setDescription]  = useState('')
  const [address,      setAddress]      = useState('')
  const [priceLevel,   setPriceLevel]   = useState<BudgetRange>('$')
  const [photoUrl,     setPhotoUrl]     = useState('')
  const [externalUrl,  setExternalUrl]  = useState('')
  const [uploading,    setUploading]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const res = await fetch('/api/gems/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      const { signedUrl, publicUrl, error: urlError } = await res.json()
      if (urlError) throw new Error(urlError)

      await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setPhotoUrl(publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/gems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, category, description, address,
          price_level: priceLevel,
          photo_url: photoUrl || null,
          url: externalUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setStep('success')
      setTimeout(() => { onSuccess?.(); handleClose() }, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('details'); setTitle(''); setCategory(''); setDescription('')
    setAddress(''); setPriceLevel('$'); setPhotoUrl(''); setExternalUrl('')
    setError(''); onClose()
  }

  const chip = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '7px 12px', borderRadius: '10px', fontSize: '12px',
    border: active ? '1px solid #6A9CC8' : '1px solid #E8E8E8',
    background: active ? '#DCE8F5' : '#FAFAFA',
    color: active ? '#1A3050' : '#666666',
    fontWeight: active ? 600 : 400, cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E8E8E8', borderRadius: '10px',
    fontSize: '14px', color: '#0D0D0D', fontFamily: 'var(--font-sans)',
    background: '#FAFAFA', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const canAdvanceDetails = title.trim() && category && description.trim().length >= 20
  const canAdvanceLocation = address.trim().length >= 5

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,10,14,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: '20px',
          width: '100%', maxWidth: '500px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
        className="animate-fade-up"
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px', borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GemSvg size={18} color="#1A3050" strokeWidth={1.6} />
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#6A9CC8', textTransform: 'uppercase' }}>
                Add a hidden gem
              </p>
              <p style={{ fontSize: '13px', color: '#666666', marginTop: '1px' }}>
                {step === 'details' ? 'Tell the story' : step === 'location' ? 'Where is it?' : step === 'media' ? 'Final details' : 'Submitted!'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F5F5F5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666666' }} className="hover:bg-[#EBEBEB]">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div style={{ display: 'flex', gap: '4px', padding: '14px 24px 0', flexShrink: 0 }}>
            {(['details', 'location', 'media'] as const).map((s, i) => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '999px',
                background: ['details', 'location', 'media'].indexOf(step) >= i ? '#1A3050' : '#E8E8E8',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <GemSvg size={48} color="#1A3050" strokeWidth={1.2} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '22px', color: '#0D0D0D', marginBottom: '8px' }}>
                Gem added!
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                Your hidden gem is now live in the feed.
              </p>
            </div>
          )}

          {step === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>Name of the place *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The back room at Vesuvio" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#1A3050')} onBlur={e => (e.target.style.borderColor = '#E8E8E8')} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '10px' }}>Category *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {CATEGORIES.map(({ value, label, emoji }) => (
                    <button key={value} onClick={() => setCategory(value)} style={chip(category === value)}>
                      <span>{emoji}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>
                  Why is this a hidden gem? *
                  <span style={{ fontWeight: 400, color: '#999', marginLeft: '6px' }}>({description.length}/500)</span>
                </label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value.slice(0, 500))}
                  placeholder="What makes this place special? Why don't most people know about it?"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.borderColor = '#1A3050')} onBlur={e => (e.target.style.borderColor = '#E8E8E8')}
                />
                {description.length > 0 && description.length < 20 && (
                  <p style={{ fontSize: '11px', color: '#C4734A', marginTop: '4px' }}>Add a bit more detail (20 characters min)</p>
                )}
              </div>
            </div>
          )}

          {step === 'location' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>
                  Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                  <input
                    value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="3158 Mission St, San Francisco, CA"
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={e => (e.target.style.borderColor = '#1A3050')} onBlur={e => (e.target.style.borderColor = '#E8E8E8')}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>We'll geocode this automatically.</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '10px' }}>Price level</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([['free', 'Free'], ['$', 'Under $15'], ['$$', '$15–$40'], ['$$$', '$40+']] as [BudgetRange, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setPriceLevel(val)} style={{ ...chip(priceLevel === val), flex: 1, justifyContent: 'center' }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '10px' }}>
                  Photo <span style={{ fontWeight: 400, color: '#999' }}>(optional but recommended)</span>
                </label>

                {photoUrl ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px' }}>
                    <img src={photoUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setPhotoUrl('')}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      style={{
                        padding: '20px', borderRadius: '12px', border: '2px dashed #E8E8E8',
                        background: '#FAFAFA', cursor: uploading ? 'not-allowed' : 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        color: '#666666', fontSize: '13px', fontFamily: 'var(--font-sans)',
                        transition: 'border-color 0.15s',
                      }}
                      className="hover:border-[#6A9CC8]"
                    >
                      <Upload size={20} strokeWidth={1.5} style={{ color: '#999' }} />
                      {uploading ? 'Uploading…' : 'Upload a photo'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#E8E8E8' }} />
                      <span style={{ fontSize: '11px', color: '#999' }}>or paste a URL</span>
                      <div style={{ flex: 1, height: '1px', background: '#E8E8E8' }} />
                    </div>

                    <div style={{ position: 'relative' }}>
                      <Link size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                      <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        style={{ ...inputStyle, paddingLeft: '34px' }}
                        onFocus={e => (e.target.style.borderColor = '#1A3050')} onBlur={e => (e.target.style.borderColor = '#E8E8E8')} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#0D0D0D', display: 'block', marginBottom: '8px' }}>
                  Website or link <span style={{ fontWeight: 400, color: '#999' }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Link size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                  <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ ...inputStyle, paddingLeft: '34px' }}
                    onFocus={e => (e.target.style.borderColor = '#1A3050')} onBlur={e => (e.target.style.borderColor = '#E8E8E8')} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: '13px', color: '#C4734A', marginTop: '14px' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'space-between', gap: '10px', flexShrink: 0 }}>
            {step !== 'details' ? (
              <button
                onClick={() => setStep(step === 'media' ? 'location' : 'details')}
                style={{ padding: '11px 20px', borderRadius: '10px', border: '1px solid #E8E8E8', background: 'none', fontSize: '13px', color: '#666666', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                className="hover:bg-[#F5F5F5]"
              >
                Back
              </button>
            ) : <div />}

            {step === 'details' && (
              <button
                onClick={() => setStep('location')} disabled={!canAdvanceDetails}
                style={{ padding: '11px 24px', borderRadius: '10px', background: canAdvanceDetails ? '#1A3050' : '#E8E8E8', color: canAdvanceDetails ? '#FFF' : '#999', border: 'none', fontSize: '14px', fontWeight: 600, cursor: canAdvanceDetails ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                className={canAdvanceDetails ? 'hover:bg-[#122340]' : ''}
              >
                Continue →
              </button>
            )}
            {step === 'location' && (
              <button
                onClick={() => setStep('media')} disabled={!canAdvanceLocation}
                style={{ padding: '11px 24px', borderRadius: '10px', background: canAdvanceLocation ? '#1A3050' : '#E8E8E8', color: canAdvanceLocation ? '#FFF' : '#999', border: 'none', fontSize: '14px', fontWeight: 600, cursor: canAdvanceLocation ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                className={canAdvanceLocation ? 'hover:bg-[#122340]' : ''}
              >
                Continue →
              </button>
            )}
            {step === 'media' && (
              <button
                onClick={handleSubmit} disabled={submitting}
                style={{ padding: '11px 24px', borderRadius: '10px', background: submitting ? '#6A9CC8' : '#1A3050', color: '#FFF', border: 'none', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(26,48,80,0.25)', transition: 'all 0.15s' }}
                className={submitting ? '' : 'hover:bg-[#122340]'}
              >
                {submitting ? 'Submitting…' : 'Submit gem ✦'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
