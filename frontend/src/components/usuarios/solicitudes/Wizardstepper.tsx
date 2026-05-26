'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Step {
    number: number;
    label: string;
    description: string;
}

interface WizardStepperProps {
    steps: Step[];
    currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    return (
        <nav aria-label="Progreso de solicitud" className="w-full">
            <ol className="flex items-start gap-0">
                {steps.map((step, idx) => {
                    const isCompleted = currentStep > step.number;
                    const isActive = currentStep === step.number;
                    const isLast = idx === steps.length - 1;

                    return (
                        <li key={step.number} className="flex flex-1 items-start">
                            {/* Step item */}
                            <div className="flex flex-col items-center flex-1">
                                {/* Círculo + línea */}
                                <div className="flex items-center w-full">
                                    {/* Línea izquierda */}
                                    {idx > 0 && (
                                        <div
                                            className={cn(
                                                'flex-1 h-0.5 transition-colors duration-300',
                                                isCompleted || isActive
                                                    ? 'bg-blue-600'
                                                    : 'bg-gray-200'
                                            )}
                                        />
                                    )}

                                    {/* Círculo */}
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-9 h-9 rounded-full border-2 font-semibold text-sm transition-all duration-300 shrink-0',
                                            isCompleted &&
                                            'bg-blue-600 border-blue-600 text-white',
                                            isActive &&
                                            'bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100',
                                            !isCompleted &&
                                            !isActive &&
                                            'bg-white border-gray-200 text-gray-400'
                                        )}
                                        aria-current={isActive ? 'step' : undefined}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4" strokeWidth={2.5} />
                                        ) : (
                                            <span>{step.number}</span>
                                        )}
                                    </div>

                                    {/* Línea derecha */}
                                    {!isLast && (
                                        <div
                                            className={cn(
                                                'flex-1 h-0.5 transition-colors duration-300',
                                                isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-2 text-center px-1">
                                    <p
                                        className={cn(
                                            'text-xs font-semibold transition-colors',
                                            isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-gray-400 hidden sm:block mt-0.5">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}