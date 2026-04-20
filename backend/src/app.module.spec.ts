import { AppModule } from './app.module'

describe('AppModule', () => {
  it('is defined', () => {
    expect(AppModule).toBeDefined()
  })

  it('has module imports metadata', () => {
    const imports = Reflect.getMetadata('imports', AppModule) as unknown[]
    expect(Array.isArray(imports)).toBe(true)
    expect(imports.length).toBeGreaterThan(0)
  })
})
