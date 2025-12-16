'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Heart, Flame, Shield } from 'lucide-react'
import PilgrimLayout from '@/components/layout/pilgrim-layout'
import { trackTempleEvent } from '@/lib/ga'
import { useI18n } from '@/lib/i18n-lite'

export default function EmergencyPage() {
  const { t } = useI18n()
  const [selectedType, setSelectedType] = React.useState('Medical')
  const [selectedSeverity, setSelectedSeverity] = React.useState('Medium')

  const getLastSelectedTemple = () => {
    try {
      const raw = localStorage.getItem('selectedTemple')
      if (!raw) return null
      const parsed = JSON.parse(raw) as { id?: number; name?: string }
      if (!parsed || (!parsed.id && !parsed.name)) return null
      return parsed
    } catch {
      return null
    }
  }

  const trackEmergencyEvent = (eventName: string, extra?: Record<string, unknown>) => {
    const selected = getLastSelectedTemple()
    trackTempleEvent(eventName, {
      temple_id: selected?.id,
      temple_name: selected?.name,
      source_page: 'emergency',
      emergency_type: selectedType,
      emergency_severity: selectedSeverity,
      ...(extra ?? {}),
    })
  }

  const emergencyTypes = [
    {
      id: 'Medical',
      label: t('emergency', 'medical'),
      icon: Heart,
      color: 'bg-purple-50 dark:bg-purple-500/15 border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-200',
    },
    {
      id: 'Stampede',
      label: t('emergency', 'stampede'),
      icon: AlertTriangle,
      color: 'bg-orange-50 dark:bg-orange-500/15 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-200',
    },
    {
      id: 'Fire',
      label: t('emergency', 'fire'),
      icon: Flame,
      color: 'bg-red-50 dark:bg-red-500/15 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200',
    },
    {
      id: 'Security',
      label: t('emergency', 'security'),
      icon: Shield,
      color: 'bg-blue-50 dark:bg-blue-500/15 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-200',
    },
  ]

  const severityLevels = [
    {
      id: 'Low',
      label: t('emergency', 'low'),
      color: 'bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-200 border-green-500 dark:border-green-400',
    },
    {
      id: 'Medium',
      label: t('emergency', 'medium'),
      color: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 border-yellow-500 dark:border-yellow-400',
    },
    {
      id: 'High',
      label: t('emergency', 'high'),
      color: 'bg-orange-100 dark:bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500 dark:border-orange-400',
    },
    {
      id: 'Critical',
      label: t('emergency', 'critical'),
      color: 'bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-200 border-red-500 dark:border-red-400',
    },
  ]

  return (
    <PilgrimLayout>
      {/* Skip to content link for accessibility */}
      <a href="#emergency-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-destructive text-white rounded px-3 py-2">{t('emergency', 'skipToContent')}</a>
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border border-destructive/30 bg-destructive/10">
          <CardContent className="p-6" role="form" aria-label="Emergency report form">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground" id="emergency-main-content">{t('emergency', 'title')}</h2>
                <p className="text-sm text-muted-foreground">{t('emergency', 'subtitle')}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Emergency Type */}
              <div>
                <Label className="text-foreground font-medium mb-3 block">{t('emergency', 'emergencyType')}</Label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Emergency Type">
                  {emergencyTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? type.color
                            : 'border-border hover:border-border/80 bg-background'
                        }`}
                        role="radio"
                        aria-checked={isSelected ? 'true' : 'false'}
                        tabIndex={0}
                        aria-label={type.label}
                      >
                        <Icon className={`w-8 h-8 ${isSelected ? '' : 'text-muted-foreground'}`} aria-hidden="true" />
                        <span className={`text-sm font-medium ${isSelected ? '' : 'text-foreground'}`}>{type.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-foreground font-medium mb-2 block">{t('emergency', 'location')}</Label>
                <Textarea
                  id="location"
                  placeholder={t('emergency', 'locationPlaceholder')}
                  className="h-20 resize-none"
                  required
                  aria-required="true"
                  aria-label="Location description"
                />
              </div>

              {/* Severity */}
              <div>
                <Label className="text-foreground font-medium mb-3 block">{t('emergency', 'severity')}</Label>
                <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Severity">
                  {severityLevels.map((level) => {
                    const isSelected = selectedSeverity === level.id
                    return (
                      <div
                        key={level.id}
                        onClick={() => setSelectedSeverity(level.id)}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                          isSelected
                            ? level.color + ' border-current'
                            : 'border-border hover:border-border/80 bg-background text-foreground'
                        }`}
                        role="radio"
                        aria-checked={isSelected ? 'true' : 'false'}
                        tabIndex={0}
                        aria-label={level.label}
                      >
                        <span className="text-sm font-medium">{level.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="secondary"
                className="w-full h-12 font-semibold text-lg"
                aria-label="Submit emergency report"
                onClick={() => trackEmergencyEvent('emergency_submit')}
              >
                {t('emergency', 'submitReport')}
              </Button>

              {/* Emergency Call Button */}
              <Button
                asChild
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg flex items-center justify-center gap-2"
                aria-label="Call emergency helpline 108"
              >
                <a
                  href="tel:108"
                  aria-label="Call emergency helpline 108"
                  className="gap-2"
                  onClick={() => trackEmergencyEvent('emergency_call_click', { phone: '108' })}
                >
                  <AlertTriangle className="w-5 h-5" />
                  {t('emergency', 'callEmergency')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PilgrimLayout>
  )
}
