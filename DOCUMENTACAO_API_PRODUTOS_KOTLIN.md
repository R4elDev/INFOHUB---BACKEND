# Documentação API Produtos - Retrofit Kotlin

## Configuração Base

### 1. Dependências no build.gradle (Module: app)
```kotlin
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
```

### 2. Classes de Modelo (Data Classes)
```kotlin
data class Produto(
    val id_produto: Int? = null,
    val nome: String,
    val descricao: String? = null,
    val id_categoria: Int,
    val id_estabelecimento: Int,
    val imagem: String? = null,
    val categoria: String? = null,
    val preco: Double,
    val preco_promocional: Double? = null,
    val data_inicio: String? = null,
    val data_fim: String? = null
)



data class ApiResponse<T>(
    val status: Boolean,
    val status_code: Int,
    val message: String?,
    val produto: T? = null,
    val produtos: List<T>? = null,
    val id: Int? = null
)
```

### 3. Interface da API
```kotlin
import retrofit2.Response
import retrofit2.http.*

interface ProdutoApiService {
    
    // ==================== CONSULTAS (GET ONLY) ====================
    
    @GET("produtos")
    suspend fun listarProdutos(): Response<ApiResponse<Produto>>
    
    @GET("produto/{id}")
    suspend fun buscarProdutoPorId(
        @Path("id") id: Int
    ): Response<ApiResponse<Produto>>
}
```

### 4. Configuração do Retrofit
```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "http://SEU_SERVIDOR:PORTA/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val client = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val produtoService: ProdutoApiService = retrofit.create(ProdutoApiService::class.java)
}
```

## Implementação das Chamadas

### 1. Repository Pattern
```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProdutoRepository {
    private val apiService = RetrofitClient.produtoService
    
    suspend fun listarProdutos(): Result<ApiResponse<Produto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.listarProdutos()
                if (response.isSuccessful) {
                    response.body()?.let { Result.success(it) } ?: Result.failure(Exception("Resposta vazia"))
                } else {
                    Result.failure(Exception("Erro HTTP: ${response.code()} - ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun buscarProdutoPorId(id: Int): Result<ApiResponse<Produto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.buscarProdutoPorId(id)
                if (response.isSuccessful) {
                    response.body()?.let { Result.success(it) } ?: Result.failure(Exception("Resposta vazia"))
                } else {
                    Result.failure(Exception("Erro HTTP: ${response.code()} - ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
```

### 2. ViewModel (Exemplo com MVVM)
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProdutoViewModel : ViewModel() {
    private val repository = ProdutoRepository()
    
    private val _produtos = MutableStateFlow<List<Produto>>(emptyList())
    val produtos: StateFlow<List<Produto>> = _produtos
    
    private val _produto = MutableStateFlow<Produto?>(null)
    val produto: StateFlow<Produto?> = _produto
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error
    
    fun listarProdutos() {
        viewModelScope.launch {
            _loading.value = true
            repository.listarProdutos()
                .onSuccess { response ->
                    if (response.status) {
                        _produtos.value = response.produtos ?: emptyList()
                    } else {
                        _error.value = response.message ?: "Erro ao carregar produtos"
                    }
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Erro desconhecido"
                }
            _loading.value = false
        }
    }
    
    fun buscarProdutoPorId(id: Int) {
        viewModelScope.launch {
            _loading.value = true
            repository.buscarProdutoPorId(id)
                .onSuccess { response ->
                    if (response.status) {
                        _produto.value = response.produto
                    } else {
                        _error.value = response.message ?: "Produto não encontrado"
                    }
                }
                .onFailure { exception ->
                    _error.value = exception.message ?: "Erro desconhecido"
                }
            _loading.value = false
        }
    }
    
    fun limparErro() {
        _error.value = null
    }
}
```

## Exemplos de Uso

### 1. Listar Produtos
```kotlin
// Em uma Activity/Fragment
viewModel.listarProdutos()

// Observar mudanças
lifecycleScope.launch {
    viewModel.produtos.collect { produtos ->
        // Atualizar RecyclerView ou lista
        adapter.submitList(produtos)
    }
}
```

### 2. Buscar Produto por ID
```kotlin
viewModel.buscarProdutoPorId(1)

// Observar resultado
lifecycleScope.launch {
    viewModel.produto.collect { produto ->
        produto?.let {
            // Usar dados do produto
            binding.textNome.text = it.nome
            binding.textPreco.text = "R$ ${it.preco}"
        }
    }
}
```



## Observações Importantes

### Autenticação
- **Não necessária**: Todas as consultas de produtos são públicas

### Códigos de Status HTTP
- **200**: Sucesso
- **404**: Produto não encontrado
- **500**: Erro interno do servidor

### Tratamento de Erros
```kotlin
// Observar erros
lifecycleScope.launch {
    viewModel.error.collect { errorMessage ->
        errorMessage?.let {
            // Exibir erro para o usuário
            Toast.makeText(this@Activity, it, Toast.LENGTH_SHORT).show()
            // ou
            Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
            
            // Limpar erro após exibir
            viewModel.limparErro()
        }
    }
}
```

### Permissões no AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Network Security Config (Para HTTP em desenvolvimento)
```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">SEU_SERVIDOR</domain>
    </domain-config>
</network-security-config>

<!-- No AndroidManifest.xml -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

## Estrutura de Resposta da API

### Sucesso (GET /produtos)
```json
{
  "status": true,
  "status_code": 200,
  "message": null,
  "produtos": [
    {
      "id_produto": 1,
      "nome": "Notebook Dell",
      "descricao": "Notebook profissional",
      "id_categoria": 1,
      "categoria": "Eletrônicos",
      "imagem": "https://exemplo.com/imagem.jpg",
      "preco": 2500.0,
      "preco_promocional": 2200.0,
      "data_inicio": "2024-01-01",
      "data_fim": "2024-12-31",
      "id_estabelecimento": 1
    }
  ]
}
```



### Erro
```json
{
  "status": false,
  "status_code": 400,
  "message": "Campos obrigatórios não fornecidos"
}
```