/**
 * Dynamic Capacity Management Service
 * Handles capacity rules, overrides, and real-time adjustments
 */

import {
  CapacityRule,
  CapacityState,
  CapacityOverride,
  SpecialEvent,
  PriorityBookingRule,
  WeatherCapacityRule,
  CapacityAnalytics,
  CapacityManagementConfig,
  CapacityCondition,
  CapacityEffect
} from '@/types/capacity-management';
import { apiFetch } from './http';
import { templePath } from './paths';

export class CapacityManagementService {
  private templeSlug: string;
  private config: CapacityManagementConfig;
  private rules: Map<string, CapacityRule> = new Map();
  private overrides: Map<string, CapacityOverride> = new Map();
  private specialEvents: Map<string, SpecialEvent> = new Map();
  private priorityRules: Map<string, PriorityBookingRule> = new Map();
  private weatherRules: Map<string, WeatherCapacityRule> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor(templeSlug: string, config: CapacityManagementConfig) {
    this.templeSlug = templeSlug;
    this.config = config;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    await this.loadRules();
    await this.loadOverrides();
    await this.loadSpecialEvents();
    
    if (this.config.ruleEngine.autoApplyRules) {
      this.startRuleEvaluation();
    }
  }

  async getCurrentCapacityState(): Promise<CapacityState> {
    try {
      // Use templePath for capacity state: /api/v1/temples/{id}/capacity/state
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/state'));
      if (!response.ok) {
        throw new Error('Failed to fetch capacity state');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching capacity state:', error);
      return this.getMockCapacityState();
    }
  }

  async evaluateCapacityRules(timestamp?: string): Promise<CapacityState> {
    const currentTime = timestamp || new Date().toISOString();
    const baseCapacity = await this.getBaseCapacity();
    const activeRules = await this.getActiveRules(currentTime);
    
    const sortedRules = activeRules.sort((a, b) => b.priority - a.priority);
    
    let capacityState = baseCapacity;
    const appliedRules: string[] = [];
    
    for (const rule of sortedRules) {
      if (await this.evaluateRuleConditions(rule, capacityState, currentTime)) {
        capacityState = this.applyRuleEffects(rule, capacityState);
        appliedRules.push(rule.id);
      }
    }
    
    const activeOverrides = await this.getActiveOverrides(currentTime);
    for (const override of activeOverrides) {
      capacityState = this.applyOverride(override, capacityState);
    }
    
    const activeEvents = await this.getActiveEvents(currentTime);
    for (const event of activeEvents) {
      for (const ruleId of event.capacityRules) {
        const rule = this.rules.get(ruleId);
        if (rule && await this.evaluateRuleConditions(rule, capacityState, currentTime)) {
          capacityState = this.applyRuleEffects(rule, capacityState);
          if (!appliedRules.includes(rule.id)) {
            appliedRules.push(rule.id);
          }
        }
      }
    }
    
    capacityState.activeRules = appliedRules;
    capacityState.timestamp = currentTime;
    
    return capacityState;
  }

  async createCapacityRule(rule: Omit<CapacityRule, 'id' | 'createdAt' | 'lastModified' | 'version'>): Promise<CapacityRule> {
    const newRule: CapacityRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1
    };

    try {
      // Use templePath for capacity rules: /api/v1/temples/{id}/capacity/rules
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/rules'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (!response.ok) {
        throw new Error('Failed to create capacity rule');
      }
      const createdRule = await response.json();
      this.rules.set(createdRule.id, createdRule);
      return createdRule;
    } catch (error) {
      console.error('Error creating capacity rule:', error);
      this.rules.set(newRule.id, newRule);
      return newRule;
    }
  }

  async updateCapacityRule(id: string, updates: Partial<CapacityRule>): Promise<CapacityRule> {
    const existingRule = this.rules.get(id);
    if (!existingRule) {
      throw new Error(`Capacity rule ${id} not found`);
    }

    const updatedRule: CapacityRule = {
      ...existingRule,
      ...updates,
      id,
      lastModified: new Date().toISOString(),
      version: existingRule.version + 1
    };

    try {
      // Use templePath for updating capacity rule: /api/v1/temples/{id}/capacity/rules/{ruleId}
      const response = await apiFetch(templePath(this.templeSlug, `capacity/rules/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRule)
      });
      if (!response.ok) {
        throw new Error('Failed to update capacity rule');
      }
      const savedRule = await response.json();
      this.rules.set(id, savedRule);
      return savedRule;
    } catch (error) {
      console.error('Error updating capacity rule:', error);
      this.rules.set(id, updatedRule);
      return updatedRule;
    }
  }

  async deleteCapacityRule(id: string): Promise<void> {
    const existingRule = this.rules.get(id);
    if (!existingRule) {
      throw new Error(`Capacity rule ${id} not found`);
    }

    try {
      // Use templePath for deleting capacity rule: /api/v1/temples/{id}/capacity/rules/{ruleId}
      const response = await apiFetch(templePath(this.templeSlug, `capacity/rules/${id}`), {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete capacity rule');
      }
      this.rules.delete(id);
    } catch (error) {
      console.error('Error deleting capacity rule:', error);
      // Still remove locally on error
      this.rules.delete(id);
    }
  }

  async createCapacityOverride(override: Omit<CapacityOverride, 'id' | 'authorizedAt'>): Promise<CapacityOverride> {
    const newOverride: CapacityOverride = {
      ...override,
      id: `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorizedAt: new Date().toISOString()
    };

    if (newOverride.requiresApproval && !newOverride.approvedBy) {
      await this.requestOverrideApproval(newOverride);
    }

    try {
      // Use templePath for overrides: /api/v1/temples/{id}/capacity/overrides
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/overrides'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOverride)
      });
      if (!response.ok) {
        throw new Error('Failed to create capacity override');
      }
      const createdOverride = await response.json();
      this.overrides.set(createdOverride.id, createdOverride);
      if (this.isOverrideActive(createdOverride)) {
        await this.evaluateCapacityRules();
      }
      return createdOverride;
    } catch (error) {
      console.error('Error creating capacity override:', error);
      this.overrides.set(newOverride.id, newOverride);
      return newOverride;
    }
  }

  async removeCapacityOverride(id: string): Promise<void> {
    const existingOverride = this.overrides.get(id);
    if (!existingOverride) {
      throw new Error(`Capacity override ${id} not found`);
    }

    try {
      // Use templePath for deleting override: /api/v1/temples/{id}/capacity/overrides/{overrideId}
      const response = await apiFetch(templePath(this.templeSlug, `capacity/overrides/${id}`), {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to remove capacity override');
      }
      this.overrides.delete(id);
      // Re-evaluate rules after removing override
      await this.evaluateCapacityRules();
    } catch (error) {
      console.error('Error removing capacity override:', error);
      // Still remove locally on error
      this.overrides.delete(id);
    }
  }

  async createSpecialEvent(event: Omit<SpecialEvent, 'id' | 'createdAt'>): Promise<SpecialEvent> {
    const newEvent: SpecialEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    for (const rule of newEvent.automaticRules) {
      const createdRule = await this.createCapacityRule({
        ...rule,
        validFrom: newEvent.startDate,
        validTo: newEvent.endDate,
        createdBy: event.createdBy
      });
      newEvent.capacityRules.push(createdRule.id);
    }

    try {
      // Use templePath for events: /api/v1/temples/{id}/capacity/events
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (!response.ok) {
        throw new Error('Failed to create special event');
      }
      const createdEvent = await response.json();
      this.specialEvents.set(createdEvent.id, createdEvent);
      return createdEvent;
    } catch (error) {
      console.error('Error creating special event:', error);
      this.specialEvents.set(newEvent.id, newEvent);
      return newEvent;
    }
  }

  async updateSpecialEvent(id: string, updates: Partial<SpecialEvent>): Promise<SpecialEvent> {
    const existingEvent = this.specialEvents.get(id);
    if (!existingEvent) {
      throw new Error(`Special event ${id} not found`);
    }

    const updatedEvent: SpecialEvent = {
      ...existingEvent,
      ...updates,
      id
    };

    try {
      // Use templePath for updating event: /api/v1/temples/{id}/capacity/events/{eventId}
      const response = await apiFetch(templePath(this.templeSlug, `capacity/events/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });
      if (!response.ok) {
        throw new Error('Failed to update special event');
      }
      const savedEvent = await response.json();
      this.specialEvents.set(id, savedEvent);
      return savedEvent;
    } catch (error) {
      console.error('Error updating special event:', error);
      this.specialEvents.set(id, updatedEvent);
      return updatedEvent;
    }
  }

  async getAvailableCapacity(
    date: string, 
    timeSlot: string, 
    darshanType: string,
    userType: string = 'public'
  ): Promise<{
    available: number;
    total: number;
    restrictions: string[];
    waitingListLength: number;
  }> {
    const capacityState = await this.getCurrentCapacityState();
    const slotCapacity = capacityState.timeSlots.find(
      slot => slot.slot === timeSlot && slot.date === date
    );

    if (!slotCapacity) {
      return {
        available: 0,
        total: 0,
        restrictions: ['Slot not available'],
        waitingListLength: 0
      };
    }

    const priorityRule = await this.getPriorityRuleForUser(userType);
    let availableCapacity = slotCapacity.availableCapacity;
    
    if (priorityRule) {
      const reservedCapacity = Math.floor(slotCapacity.adjustedCapacity * priorityRule.capacityReservation / 100);
      availableCapacity += reservedCapacity;
    }

    return {
      available: Math.max(0, availableCapacity),
      total: slotCapacity.adjustedCapacity,
      restrictions: slotCapacity.restrictions.map(r => r.description),
      waitingListLength: slotCapacity.waitingList
    };
  }

  async getCapacityAnalytics(period: 'day' | 'week' | 'month'): Promise<CapacityAnalytics> {
    try {
      // Use templePath for analytics: /api/v1/temples/{id}/capacity/analytics?period=...
      const response = await apiFetch(templePath(this.templeSlug, `capacity/analytics?period=${period}`));
      if (!response.ok) {
        throw new Error('Failed to fetch capacity analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching capacity analytics:', error);
      return this.getMockAnalytics(period);
    }
  }

  private async loadRules(): Promise<void> {
    try {
      // Use templePath for rules: /api/v1/temples/{id}/capacity/rules
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/rules'));
      if (response.ok) {
        const rules: CapacityRule[] = await response.json();
        rules.forEach(rule => this.rules.set(rule.id, rule));
      }
    } catch (error) {
      console.error('Error loading capacity rules:', error);
      this.loadDefaultRules();
    }
  }

  private async loadOverrides(): Promise<void> {
    try {
      // Use templePath for overrides: /api/v1/temples/{id}/capacity/overrides
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/overrides'));
      if (response.ok) {
        const overrides: CapacityOverride[] = await response.json();
        overrides.forEach(override => this.overrides.set(override.id, override));
      }
    } catch (error) {
      console.error('Error loading capacity overrides:', error);
    }
  }

  private async loadSpecialEvents(): Promise<void> {
    try {
      // Use templePath for events: /api/v1/temples/{id}/capacity/events
      const response = await apiFetch(templePath(this.templeSlug, 'capacity/events'));
      if (response.ok) {
        const events: SpecialEvent[] = await response.json();
        events.forEach(event => this.specialEvents.set(event.id, event));
      }
    } catch (error) {
      console.error('Error loading special events:', error);
    }
  }

  private loadDefaultRules(): void {
    const defaultRules: CapacityRule[] = [
      {
        id: 'max_occupancy_rule',
        name: 'Maximum Occupancy Limit',
        description: 'Ensure temple never exceeds maximum safe capacity',
        priority: 1000,
        active: true,
        conditions: [
          {
            type: 'current_occupancy',
            operator: 'greater_than',
            value: this.config.defaultRules.maxOccupancyRate * 100
          }
        ],
        effects: [
          {
            type: 'booking_limit',
            target: { scope: 'temple' },
            operation: 'set',
            value: 0
          }
        ],
        validFrom: new Date().toISOString(),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1
      }
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));
  }

  private startRuleEvaluation(): void {
    this.evaluationInterval = setInterval(() => {
      this.evaluateCapacityRules().catch(console.error);
    }, this.config.ruleEngine.evaluationInterval * 1000);
  }

  private async getActiveRules(timestamp: string): Promise<CapacityRule[]> {
    return Array.from(this.rules.values()).filter(rule => {
      if (!rule.active) return false;
      
      const ruleStart = new Date(rule.validFrom);
      const ruleEnd = rule.validTo ? new Date(rule.validTo) : null;
      const currentTime = new Date(timestamp);
      
      if (currentTime < ruleStart) return false;
      if (ruleEnd && currentTime > ruleEnd) return false;
      
      return true;
    });
  }

  private async getActiveOverrides(timestamp: string): Promise<CapacityOverride[]> {
    return Array.from(this.overrides.values()).filter(override => {
      return this.isOverrideActive(override, timestamp);
    });
  }

  private async getActiveEvents(timestamp: string): Promise<SpecialEvent[]> {
    return Array.from(this.specialEvents.values()).filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const currentTime = new Date(timestamp);
      
      return currentTime >= eventStart && currentTime <= eventEnd && event.status === 'active';
    });
  }

  private isOverrideActive(override: CapacityOverride, timestamp?: string): boolean {
    const currentTime = new Date(timestamp || new Date().toISOString());
    const overrideStart = new Date(override.validFrom);
    const overrideEnd = override.validTo ? new Date(override.validTo) : null;
    
    if (currentTime < overrideStart) return false;
    if (overrideEnd && currentTime > overrideEnd) return false;
    if (override.requiresApproval && !override.approvedBy) return false;
    
    return true;
  }

  private async evaluateRuleConditions(rule: CapacityRule, capacityState: CapacityState, timestamp: string): Promise<boolean> {
    for (const condition of rule.conditions) {
      if (!await this.evaluateCondition(condition, capacityState, timestamp)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: CapacityCondition, capacityState: CapacityState, timestamp: string): Promise<boolean> {
    const currentTime = new Date(timestamp);
    
    switch (condition.type) {
      case 'current_occupancy':
        return this.compareValues(capacityState.utilizationRate, condition.operator, condition.value);
        
      case 'time_range':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const [startTime, endTime] = condition.value as string[];
          const currentTimeStr = currentTime.toTimeString().substring(0, 5);
          return currentTimeStr >= startTime && currentTimeStr <= endTime;
        }
        return false;
        
      case 'day_of_week':
        const dayOfWeek = currentTime.getDay();
        return this.compareValues(dayOfWeek, condition.operator, condition.value);
        
      default:
        return true;
    }
  }

  private compareValues(actual: number | string, operator: string, expected: string | number | string[] | number[] | boolean): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'greater_than':
        return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      case 'less_than':
        return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      case 'in':
        return Array.isArray(expected) && (expected as (string | number)[]).includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !(expected as (string | number)[]).includes(actual);
      default:
        return false;
    }
  }

  private applyRuleEffects(rule: CapacityRule, capacityState: CapacityState): CapacityState {
    let newState = { ...capacityState };
    
    for (const effect of rule.effects) {
      newState = this.applyEffect(effect, newState);
    }
    
    return newState;
  }

  private applyEffect(effect: CapacityEffect, capacityState: CapacityState): CapacityState {
    const newState = { ...capacityState };
    
    switch (effect.type) {
      case 'capacity_adjustment':
        if (effect.target.scope === 'temple') {
          newState.totalCapacity = this.calculateNewValue(
            newState.totalCapacity,
            effect.operation,
            effect.value
          );
          newState.availableCapacity = Math.max(0, newState.totalCapacity - newState.currentOccupancy);
        }
        break;
        
      case 'zone_capacity_adjustment':
        if (effect.target.scope === 'zone' && effect.target.identifier) {
          const zone = newState.zones.find(z => z.zoneId === effect.target.identifier);
          if (zone) {
            zone.adjustedCapacity = this.calculateNewValue(
              zone.baseCapacity,
              effect.operation,
              effect.value
            );
            zone.availableCapacity = Math.max(0, zone.adjustedCapacity - zone.currentOccupancy);
          }
        }
        break;
        
      default:
        break;
    }
    
    return newState;
  }

  private applyOverride(override: CapacityOverride, capacityState: CapacityState): CapacityState {
    const newState = { ...capacityState };
    
    switch (override.type) {
      case 'capacity_increase':
      case 'capacity_decrease':
        if (override.target.scope === 'temple') {
          newState.totalCapacity = override.newValue;
          newState.availableCapacity = Math.max(0, newState.totalCapacity - newState.currentOccupancy);
        }
        break;
        
      case 'zone_closure':
        if (override.target.scope === 'zone' && override.target.identifier) {
          const zone = newState.zones.find(z => z.zoneId === override.target.identifier);
          if (zone) {
            zone.adjustedCapacity = 0;
            zone.availableCapacity = 0;
          }
        }
        break;
    }
    
    newState.manualOverrides.push(override);
    return newState;
  }

  private calculateNewValue(current: number, operation: string, value: number): number {
    switch (operation) {
      case 'set':
        return value;
      case 'add':
        return current + value;
      case 'subtract':
        return Math.max(0, current - value);
      case 'multiply':
        return Math.floor(current * value);
      default:
        return current;
    }
  }

  private async getBaseCapacity(): Promise<CapacityState> {
    return this.getMockCapacityState();
  }

  private async getPriorityRuleForUser(userType: string): Promise<PriorityBookingRule | null> {
    const priorityRule = Array.from(this.priorityRules.values()).find(
      rule => rule.active && rule.userTypes.includes(userType)
    );
    return priorityRule || null;
  }

  private async requestOverrideApproval(override: CapacityOverride): Promise<void> {
    console.log('Requesting approval for override:', override.id);
  }

  private getMockCapacityState(): CapacityState {
    return {
      templeId: this.templeSlug,
      timestamp: new Date().toISOString(),
      totalCapacity: 500,
      currentOccupancy: 180,
      availableCapacity: 320,
      utilizationRate: 36,
      zones: [
        {
          zoneId: 'main-hall',
          zoneName: 'Main Darshan Hall',
          baseCapacity: 300,
          adjustedCapacity: 300,
          currentOccupancy: 120,
          availableCapacity: 180,
          utilizationRate: 40,
          restrictions: []
        },
        {
          zoneId: 'vip-section',
          zoneName: 'VIP Darshan Area',
          baseCapacity: 50,
          adjustedCapacity: 50,
          currentOccupancy: 15,
          availableCapacity: 35,
          utilizationRate: 30,
          restrictions: []
        }
      ],
      timeSlots: [
        {
          slot: '09:00-10:00',
          date: new Date().toISOString().split('T')[0],
          baseCapacity: 50,
          adjustedCapacity: 50,
          bookedCapacity: 20,
          availableCapacity: 30,
          waitingList: 0,
          restrictions: []
        }
      ],
      activeRules: [],
      manualOverrides: []
    };
  }

  private getMockAnalytics(period: string): CapacityAnalytics {
    return {
      period: period as 'day' | 'week' | 'month',
      data: [],
      insights: [
        {
          type: 'peak_utilization',
          title: 'Peak utilization during festivals',
          description: 'Capacity reaches 95% during major festivals',
          impact: 'high',
          actionRequired: true
        }
      ],
      recommendations: [
        {
          id: 'rec_1',
          type: 'capacity_increase',
          title: 'Increase VIP zone capacity',
          description: 'Add 20 more spots to VIP zone during peak times',
          expectedImpact: 'Reduce wait times by 15 minutes',
          implementation: 'manual',
          priority: 1
        }
      ]
    };
  }

  destroy(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
  }
}