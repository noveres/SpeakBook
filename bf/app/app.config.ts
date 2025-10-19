import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core'
import { provideRouter } from '@angular/router'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
// import { AuthInterceptor } from './core/interceptors/auth.interceptor'
import { routes } from './app.routes'
import { TranslateModule, provideTranslateService } from '@ngx-translate/core'
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    // 匯入指令/管道
    importProvidersFrom(TranslateModule.forRoot()),
    // 提供翻譯服務配置
    ...provideTranslateService({ lang: 'zh-TW', fallbackLang: 'zh-TW' }),
    // 提供 HTTP Loader（從 document.head.baseURI + i18n/*.json 載入）
    ...provideTranslateHttpLoader({ prefix: `${document.head.baseURI}i18n/`, suffix: '.json' }),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,
    //   multi: true,
    // },
  ],
}
