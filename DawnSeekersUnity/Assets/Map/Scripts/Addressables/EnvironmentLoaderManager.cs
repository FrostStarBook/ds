using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class EnvironmentLoaderManager : MonoBehaviour
{
    public static System.Action EnvironmentAssetsLoaded;
    public static EnvironmentLoaderManager instance;

    [SerializeField]
    AssetLabelReference environmentAssetsLabel;

    [SerializeField]
    Transform tileContainer;

    [SerializeField]
    bool loadDynamic;

    [SerializeField]
    GameObject tilePrefab;

    private Task loadAssets;

    private GameObject _tilePrefab;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
        //Addressables.InitializeAsync();
    }

    void Start()
    {
        if (loadDynamic)
            Caller();
        else
        {
            _tilePrefab = tilePrefab;
            EnvironmentAssetsLoaded?.Invoke();
        }
    }

    async void Caller()
    {
        loadAssets = LoadAssetsAsync(environmentAssetsLabel);
        await loadAssets;
    }

    async Task LoadAssetsAsync(AssetLabelReference label)
    {
        Debug.Log("Loading environment assets...");
        AsyncOperationHandle operationHandle = Addressables.LoadAssetAsync<GameObject>(label);
        await operationHandle.Task;
        _tilePrefab = (GameObject)operationHandle.Result;
        EnvironmentAssetsLoaded?.Invoke();
        Debug.Log("Environment assets loaded.");
    }

    public void AddTile(Vector3 position)
    {
        Transform tile = Instantiate(_tilePrefab, tileContainer).transform;
        tile.position = position - MapHeightManager.instance.GetHeightOffsetAtPosition(position);
    }
}